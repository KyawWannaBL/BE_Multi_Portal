// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Camera, CheckCircle, Package, QrCode, Smartphone, Users, Download, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/state/auth";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

type Txt = { en: string; my: string };

const TXT = {
  title: { en: "Express Delivery QR Operations Manual", my: "အမြန်ပို့ဆောင်မှု QR လုပ်ငန်းဆောင်ရွက်မှု လမ်းညွှန်" },
  subtitle: { en: "Comprehensive guide for QR code scanning, POD capture, and exception handling", my: "QR စကန်ခြင်း၊ ပို့ဆောင်ပြီးသက်သေ (POD) ရယူခြင်းနှင့် အထူးအခြေအနေ (Exception) ကိုင်တွယ်ခြင်းအတွက် စုံလင်လမ်းညွှန်" },
  bilingual: { en: "Bilingual view", my: "ဘာသာနှစ်မျိုးပြ" },
  switchLanguage: { en: "Switch language", my: "ဘာသာပြောင်း" },
  downloadPdf: { en: "Download PDF", my: "PDF ဒေါင်းလုပ်ရယူရန်" },
  downloading: { en: "Generating PDF...", my: "PDF ဖန်တီးနေပါသည်..." },
  overviewTitle: { en: "QR Code System Overview", my: "QR စနစ် အကျဉ်းချုပ်" },
  overviewWhatTitle: { en: "What is the QR Code System?", my: "QR စနစ် ဆိုတာဘာလဲ?" },
  overviewWhatBody: { en: "Our QR code system provides real-time tracking and verification for all shipments. Each package gets a unique QR code that contains encrypted shipment information.", my: "ကျွန်ုပ်တို့၏ QR စနစ်သည် ပို့ဆောင်မှုအားလုံးအတွက် အချိန်နှင့်တပြေးညီ ခြေရာခံခြင်းနှင့် အတည်ပြုခြင်းကို ပေးစွမ်းပါသည်။" },
  overviewBenefitsTitle: { en: "Key Benefits", my: "အဓိက အကျိုးကျေးဇူးများ" },
  overviewBenefits: [
    { en: "Real-time shipment tracking", my: "အချိန်နှင့်တပြေးညီ ပို့ဆောင်မှု ခြေရာခံ" },
    { en: "Reduced manual errors", my: "လက်ဖြင့် မှားယွင်းမှု လျော့နည်း" },
    { en: "Faster processing times", my: "လုပ်ငန်းစဉ်များ ပိုမိုမြန်ဆန်" },
    { en: "Enhanced security", my: "လုံခြုံရေး ပိုမိုကောင်းမွန်" },
  ],
  designTitle: { en: "QR Code Design & Structure", my: "QR Design & Structure" },
  containsTitle: { en: "QR Code Contains:", my: "QR ထဲတွင် ပါဝင်သည်များ:" },
  containsLeft: [
    { en: "AWB Number: Unique shipment identifier", my: "AWB နံပါတ်: ပို့ဆောင်မှု သီးသန့်အမှတ်" },
    { en: "Checksum: Data integrity verification", my: "Checksum: ဒေတာမှန်ကန်မှု အတည်ပြု" },
    { en: "Version: QR code format version", my: "Version: QR ဖော်မတ်ဗားရှင်း" },
  ],
  containsRight: [
    { en: "Routing Info: Destination hub/branch", my: "Routing Info: သွားရမည့် hub/branch" },
    { en: "Timestamp: Generation time", my: "Timestamp: QR ထုတ်ချိန်" },
    { en: "Security Hash: Anti-tampering protection", my: "Security Hash: ပြောင်းလဲတားဆီး လုံခြုံရေး" },
  ],
  placementTitle: { en: "Label Placement Guidelines:", my: "Label တပ်ဆင်ရန် လမ်းညွှန်:" },
  placement: [
    { en: "Place on the top-right corner of the package", my: "ပစ္စည်း၏ အပေါ်ညာထောင့်တွင် တပ်ပါ" },
    { en: "Ensure the label is flat and not wrinkled", my: "Label ကို ခေါက်နင်းမထားဘဲ ပြားပြားအောင်ထားပါ" },
    { en: "Avoid placing over seams or edges", my: "ချုပ်လေ့သလို အစွန်း/ချုပ်ရာပေါ် မတပ်ပါနှင့်" },
    { en: "Keep away from other barcodes or labels", my: "အခြား barcode/label များနှင့် ခွာထားပါ" },
  ],
  printingTitle: { en: "QR Code Printing Process", my: "QR Print လုပ်ငန်းစဉ်" },
  printingSteps: [
    { n: "1", title: { en: "Generate", my: "ထုတ်လုပ်" }, body: { en: "System generates QR code with shipment details", my: "စနစ်မှ ပို့ဆောင်မှုအသေးစိတ်နှင့် QR ကို ထုတ်လုပ်ပါသည်" } },
    { n: "2", title: { en: "Print", my: "ပရင့်ထုတ်" }, body: { en: "Print on thermal label printer with customer info", my: "Thermal label printer ဖြင့် ဖောက်သည်အချက်အလက်ပါအောင် ပရင့်ထုတ်ပါ" } },
    { n: "3", title: { en: "Apply", my: "တပ်ဆင်" }, body: { en: "Affix label to package following placement guidelines", my: "တပ်ဆင်လမ်းညွှန်အတိုင်း ပစ္စည်းပေါ်တွင် Label ကို တပ်ပါ" } },
  ],
  scanningTitle: { en: "QR Code Scanning Procedures", my: "QR Scan လုပ်နည်းများ" },
  pickupBadge: { en: "Pickup", my: "ပစ္စည်းယူ" },
  pickupTitle: { en: "Pickup Scanning", my: "Pickup စကန်" },
  pickupWhen: { en: "At customer location during pickup", my: "ဖောက်သည်နေရာတွင် ပစ္စည်းယူချိန်" },
  pickupWho: { en: "Courier/Pickup Agent", my: "Courier / Pickup Agent" },
  pickupSteps: [
    { en: "Open QR Scanner app", my: "QR Scanner app ကို ဖွင့်ပါ" },
    { en: 'Select "Pickup Scan" mode', my: '"Pickup Scan" mode ကို ရွေးပါ' },
    { en: "Scan QR code on package", my: "ပစ္စည်းပေါ်ရှိ QR ကို စကန်ပါ" },
    { en: "Verify AWB matches pickup list", my: "AWB သည် pickup list နှင့် ကိုက်ညီမှု စစ်ပါ" },
    { en: "Capture GPS location automatically", my: "GPS location ကို အလိုအလျောက် ရယူပါ" },
    { en: "Add any pickup notes if needed", my: "လိုအပ်ပါက မှတ်စုများ ထည့်ပါ" },
    { en: "Confirm scan to update status", my: "အတည်ပြု၍ status ကို အပ်ဒိတ်လုပ်ပါ" },
  ],
  hubBadge: { en: "Hub", my: "ဟပ်" },
  hubTitle: { en: "Hub Inbound/Outbound Scanning", my: "Hub Inbound/Outbound စကန်" },
  hubWhen: { en: "Package arrival and departure at hub", my: "Hub သို့ ရောက်/ထွက်ချိန်" },
  hubWho: { en: "Hub Scanner/Sorter", my: "Hub Scanner / Sorter" },
  hubSteps: [
    { en: "Select appropriate scan mode (Inbound/Outbound)", my: "Inbound/Outbound mode ကို မှန်ကန်စွာ ရွေးပါ" },
    { en: "Scan packages in batches", my: "Batch အလိုက် စကန်ပါ" },
    { en: "System validates routing information", my: "Routing info ကို စနစ်မှ စစ်ဆေးပါသည်" },
    { en: "Sort packages according to destination", my: "သွားရမည့်နေရာအလိုက် စီပါ" },
    { en: "Generate bag/manifest reports", my: "Bag/Manifest report ထုတ်ပါ" },
    { en: "Seal bags and update system", my: "Bag ကို တံဆိပ်ပိတ်ပြီး စနစ်ကို အပ်ဒိတ်လုပ်ပါ" },
  ],
  deliveryBadge: { en: "Delivery", my: "ပို့ဆောင်" },
  deliveryTitle: { en: "Delivery Scanning", my: "Delivery စကန်" },
  deliveryWhen: { en: "At customer location during delivery", my: "ဖောက်သည်နေရာတွင် ပို့ဆောင်ချိန်" },
  deliveryWho: { en: "Delivery Courier", my: "Delivery Courier" },
  deliverySteps: [
    { en: 'Select "Delivery Scan" mode', my: '"Delivery Scan" mode ကို ရွေးပါ' },
    { en: "Scan package QR code", my: "ပစ္စည်း QR ကို စကန်ပါ" },
    { en: "Verify delivery address", my: "ပို့ဆောင်ရန် လိပ်စာကို စစ်ဆေးပါ" },
    { en: "Proceed to POD capture", my: "POD ရယူခြင်းသို့ ဆက်သွားပါ" },
    { en: "Complete delivery confirmation", my: "ပို့ဆောင်ပြီး အတည်ပြုချက်ကို ပြည့်စုံစွာ ပြုလုပ်ပါ" },
  ],
  podTitle: { en: "Electronic Proof of Delivery (e-POD)", my: "ပို့ဆောင်ပြီးသက်သေ (e-POD)" },
  signatureTitle: { en: "Signature POD", my: "လက်မှတ် POD" },
  signatureBody: { en: "Customer signs on mobile device screen. Capture clear signature with recipient name.", my: "ဖောက်သည်သည် မိုဘိုင်းစခရင်ပေါ်တွင် လက်မှတ်ရေးထိုးပါသည်။ လက်ခံသူနာမည်နှင့်အတူ ရှင်းလင်းသော လက်မှတ်ကို ရယူပါ။" },
  otpTitle: { en: "OTP POD", my: "OTP POD" },
  otpBody: { en: "Customer provides OTP sent to their mobile. Verify and confirm delivery.", my: "ဖောက်သည်ဖုန်းသို့ ပို့ထားသော OTP ကို ရယူပြီး စစ်ဆေးကာ ပို့ဆောင်ပြီး အတည်ပြုပါ။" },
  photoTitle: { en: "Photo POD", my: "ဓာတ်ပုံ POD" },
  photoBody: { en: "Take photo of delivered package at customer location with timestamp.", my: "ဖောက်သည်နေရာတွင် ပစ္စည်းထားပြီး အချိန်တံဆိပ်ပါအောင် ဓာတ်ပုံရိုက်ပါ။" },
  podBestTitle: { en: "POD Best Practices:", my: "POD လုပ်ရာတွင် သတိပြုရန်:" },
  podBest: [
    { en: "Always verify recipient identity", my: "လက်ခံသူအတည်ပြုချက်ကို အမြဲစစ်ပါ" },
    { en: "Ensure GPS location is captured", my: "GPS location ရယူထားမှုကို သေချာပါစေ" },
    { en: "Take clear, well-lit photos", my: "အလင်းရောင်ကောင်းပြီး ရှင်းလင်းသော ဓာတ်ပုံရိုက်ပါ" },
    { en: "Get complete signature (not just initials)", my: "ကနဦးစာလုံးမက အပြည့်အစုံ လက်မှတ်ရယူပါ" },
    { en: "Record any special delivery instructions", my: "အထူးညွှန်ကြားချက်များကို မှတ်တမ်းတင်ပါ" },
  ],
  exceptionTitle: { en: "Exception Handling", my: "Exception ကိုင်တွယ်ခြင်း" },
  exceptionCommonTitle: { en: "Common Delivery Exceptions:", my: "တွေ့ရများသော Delivery Exception များ:" },
  exceptionCommon: [
    { en: "Customer not available", my: "ဖောက်သည် မရှိ" },
    { en: "Incorrect/incomplete address", my: "လိပ်စာ မမှန်/မပြည့်စုံ" },
    { en: "Customer refused delivery", my: "ဖောက်သည် လက်မခံ" },
    { en: "Package damaged", my: "ပစ္စည်း ပျက်စီး" },
    { en: "Security concerns", my: "လုံခြုံရေး စိုးရိမ်ချက်" },
    { en: "Weather delays", my: "ရာသီဥတုကြောင့် နှောင့်နှေး" },
  ],
  exceptionProcessTitle: { en: "Exception Process:", my: "လုပ်ငန်းစဉ်:" },
  exceptionSteps: [
    { en: "Select exception type", my: "Exception အမျိုးအစား ရွေးပါ" },
    { en: "Provide detailed reason", my: "အကြောင်းပြချက်ကို အသေးစိတ်ရေးပါ" },
    { en: "Take photo evidence (if required)", my: "လိုအပ်ပါက အထောက်အထား ဓာတ်ပုံရိုက်ပါ" },
    { en: "Add additional notes", my: "ထပ်တိုးမှတ်စုများ ထည့်ပါ" },
    { en: "Submit exception report", my: "Report ကို တင်သွင်းပါ" },
    { en: "Follow next action guidance", my: "နောက်တစ်ဆင့် လုပ်ဆောင်ရန် ညွှန်ကြားချက်ကို လိုက်နာပါ" },
  ],
  controlsTitle: { en: "Operational Controls & Guidelines", my: "လုပ်ငန်းထိန်းချုပ်မှုနှင့် လမ်းညွှန်" },
  qcTitle: { en: "Quality Controls:", my: "အရည်အသွေး ထိန်းချုပ်မှု:" },
  qc: [
    { en: "Verify QR code readability before dispatch", my: "ထွက်ခွာမီ QR ဖတ်လို့ရမရ စစ်ပါ" },
    { en: "Ensure GPS is enabled on all devices", my: "စက်အားလုံးတွင် GPS ဖွင့်ထားပါ" },
    { en: "Regular device battery checks", my: "ဘက်ထရီ အမြဲစစ်ပါ" },
    { en: "Daily app synchronization", my: "နေ့စဉ် App sync လုပ်ပါ" },
    { en: "Photo quality verification", my: "ဓာတ်ပုံ အရည်အသွေး စစ်ပါ" },
  ],
  securityTitle: { en: "Security Measures:", my: "လုံခြုံရေး လုပ်ထုံးလုပ်နည်း:" },
  security: [
    { en: "Device authentication required", my: "Device authentication လိုအပ်သည်" },
    { en: "Encrypted data transmission", my: "ဒေတာပို့ဆောင်မှုကို encrypted လုပ်ထားသည်" },
    { en: "Audit trail for all scans", my: "စကန်အားလုံးအတွက် Audit trail ရှိသည်" },
    { en: "Role-based access control", my: "Role အလိုက် ဝင်ရောက်ခွင့် ထိန်းချုပ်သည်" },
    { en: "Regular security updates", my: "လုံခြုံရေး အပ်ဒိတ်များ ပြုလုပ်သည်" },
  ],
  troubleshootTitle: { en: "Troubleshooting Guide", my: "အခက်အခဲ ဖြေရှင်းရန်" },
  ts1Title: { en: "QR Code Won't Scan:", my: "QR စကန်မရပါ:" },
  ts1: [
    { en: "Clean camera lens", my: "ကင်မရာလန့်စ် သန့်ရှင်းပါ" },
    { en: "Ensure adequate lighting", my: "အလင်းရောင် လုံလောက်အောင်ထားပါ" },
    { en: "Hold device steady", my: "စက်ကို တည်ငြိမ်စွာ ကိုင်ပါ" },
    { en: "Try manual AWB entry", my: "AWB ကို လက်ဖြင့် ထည့်စမ်းပါ" },
  ],
  ts2Title: { en: "App Not Syncing:", my: "App sync မဖြစ်ပါ:" },
  ts2: [
    { en: "Check internet connection", my: "အင်တာနက်ချိတ်ဆက်မှု စစ်ပါ" },
    { en: "Force sync from settings", my: "Settings မှ Force sync လုပ်ပါ" },
    { en: "Restart application", my: "App ကို ပြန်ဖွင့်ပါ" },
    { en: "Contact IT support if persistent", my: "မဖြေရှင်းနိုင်ပါက IT ကို ဆက်သွယ်ပါ" },
  ],
  ts3Title: { en: "GPS Not Working:", my: "GPS မအလုပ်လုပ်ပါ:" },
  ts3: [
    { en: "Enable location services", my: "Location services ဖွင့်ပါ" },
    { en: "Check app permissions", my: "App permission များ စစ်ပါ" },
    { en: "Move to open area", my: "အပြင်ပိုင်း/ဖွင့်လှစ်နေရာသို့ ရွှေ့ပါ" },
    { en: "Restart device if needed", my: "လိုအပ်ပါက စက်ကို ပြန်စတင်ပါ" },
  ],
  supportTitle: { en: "Support & Contact Information", my: "အကူအညီနှင့် ဆက်သွယ်ရန်" },
  techTitle: { en: "Technical Support:", my: "နည်းပညာ အကူအညီ:" },
  opsTitle: { en: "Operations Support:", my: "လုပ်ငန်းပိုင်း အကူအညီ:" },
  emgTitle: { en: "Emergency Escalation:", my: "အရေးပေါ် ဆက်သွယ်ရန်:" },
  phone: { en: "Phone:", my: "ဖုန်း:" },
  email: { en: "Email:", my: "အီးမေးလ်:" },
  avail: { en: "Available 24/7", my: "၂၄/၇ ရရှိနိုင်" },
} as const;

function useLocalBoolean(key: string, defaultValue: boolean) {
  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    try { const raw = localStorage.getItem(key); if (raw !== null) setValue(raw === "1"); } catch {}
  }, [key]);
  useEffect(() => {
    try { localStorage.setItem(key, value ? "1" : "0"); } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

function useBilingualText(bilingual: boolean) {
  const { lang } = useLanguage();
  return useMemo(() => {
    const pick = (t: Txt) => (lang === "en" ? t.en : t.my);
    const render = (t: Txt, opts?: { inline?: boolean; secondaryClassName?: string }) => {
      const inline = Boolean(opts?.inline);
      const secClass = opts?.secondaryClassName ?? "text-sm text-muted-foreground";
      if (!bilingual) return pick(t);
      if (inline) return <><span className="mr-1">{t.en}</span><span className={secClass}> / {t.my}</span></>;
      return <><span className="block">{t.en}</span><span className={`block ${secClass}`}>{t.my}</span></>;
    };
    const badge = (t: Txt) => (bilingual ? `${t.en} / ${t.my}` : pick(t));
    return { render, badge };
  }, [bilingual, lang]);
}

export function OperationalManual() {
  const { toggleLang } = useLanguage();
  const { user } = useAuth(); // Fetch user for "Generated By"
  const [bilingual, setBilingual] = useLocalBoolean("btx_manual_bilingual", true);
  const { render, badge } = useBilingualText(bilingual);
  const [isDownloading, setIsDownloading] = useState(false);

  const companyName = import.meta.env.VITE_COMPANY_NAME || "BRITIUM EXPRESS";

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById("manual-pdf-content");
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#05080F" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const generatedBy = user?.email || user?.name || "System User";
      const timestamp = new Date().toLocaleString();

      let heightLeft = pdfHeight;
      let position = 20; // Top margin for header

      // Multi-page image splitting logic
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= (pageHeight - position);

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      // Add Headers and Footers to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);

        // Header Background Cover
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, 18, "F");

        // Header Text (Company Name)
        pdf.setFontSize(12);
        pdf.setTextColor(20, 20, 20);
        pdf.text(`${companyName} - Operations Manual`, 14, 12);

        // Footer Background Cover
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, pageHeight - 15, pdfWidth, 15, "F");

        // Footer Text (Generated By & Page Numbers)
        pdf.setFontSize(9);
        pdf.setTextColor(100);
        pdf.text(`Generated by: ${generatedBy} | ${timestamp}`, 14, pageHeight - 8);
        pdf.text(`Page ${i} of ${pageCount}`, pdfWidth - 25, pageHeight - 8);
      }
      
      pdf.save(`${companyName.replace(/\s+/g, "_")}_Operational_Manual.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="text-left space-y-2 flex-1">
          <h1 className="text-3xl font-bold">{render(TXT.title)}</h1>
          <p className="text-muted-foreground">{render(TXT.subtitle)}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{render(TXT.bilingual, { inline: true })}</span>
            <Switch checked={bilingual} onCheckedChange={setBilingual} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={toggleLang}>
              {render(TXT.switchLanguage, { inline: true })}
            </Button>
            <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={downloadPDF} disabled={isDownloading}>
              {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              {isDownloading ? render(TXT.downloading, { inline: true }) : render(TXT.downloadPdf, { inline: true })}
            </Button>
          </div>
        </div>
      </div>
      
      <div id="manual-pdf-content" className="space-y-6 bg-[#05080F] p-4 rounded-xl">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5" />{render(TXT.overviewTitle, { inline: true })}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><div><h4 className="font-semibold mb-2">{render(TXT.overviewWhatTitle, { inline: true })}</h4><p className="text-sm text-muted-foreground">{render(TXT.overviewWhatBody)}</p></div><div><h4 className="font-semibold mb-2">{render(TXT.overviewBenefitsTitle, { inline: true })}</h4><ul className="text-sm text-muted-foreground space-y-1">{TXT.overviewBenefits.map(b => <li key={b.en}>• {render(b, { inline: true, secondaryClassName: "text-muted-foreground" })}</li>)}</ul></div></div></CardContent></Card>
        
        <Card><CardHeader><CardTitle>{render(TXT.designTitle, { inline: true })}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="bg-muted p-4 rounded-lg"><h4 className="font-semibold mb-2">{render(TXT.containsTitle, { inline: true })}</h4><div className="grid md:grid-cols-2 gap-4 text-sm"><div>{TXT.containsLeft.map(i => <p key={i.en}>{render(i, { inline: true, secondaryClassName: "text-muted-foreground" })}</p>)}</div><div>{TXT.containsRight.map(i => <p key={i.en}>{render(i, { inline: true, secondaryClassName: "text-muted-foreground" })}</p>)}</div></div></div><div className="space-y-2"><h4 className="font-semibold">{render(TXT.placementTitle, { inline: true })}</h4><ul className="text-sm text-muted-foreground space-y-1">{TXT.placement.map(p => <li key={p.en}>• {render(p, { inline: true, secondaryClassName: "text-muted-foreground" })}</li>)}</ul></div></CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />{render(TXT.printingTitle, { inline: true })}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-3 gap-4">{TXT.printingSteps.map(s => (<div key={s.n} className="text-center space-y-2"><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 font-bold">{s.n}</div><h4 className="font-semibold">{render(s.title, { inline: true })}</h4><p className="text-sm text-muted-foreground">{render(s.body)}</p></div>))}</div></CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5" />{render(TXT.scanningTitle, { inline: true })}</CardTitle></CardHeader><CardContent className="space-y-6"><div><h4 className="font-semibold mb-3 flex items-center gap-2"><Badge variant="outline">{badge(TXT.pickupBadge)}</Badge>{render(TXT.pickupTitle, { inline: true })}</h4><div className="space-y-2 text-sm"><p><strong>{render({ en: "When:", my: "အချိန်:" }, { inline: true })}</strong> {render(TXT.pickupWhen, { inline: true, secondaryClassName: "text-muted-foreground" })}</p><p><strong>{render({ en: "Who:", my: "တာဝန်ရှိသူ:" }, { inline: true })}</strong> {render(TXT.pickupWho, { inline: true, secondaryClassName: "text-muted-foreground" })}</p><p><strong>{render({ en: "Process:", my: "လုပ်ငန်းစဉ်:" }, { inline: true })}</strong></p><ol className="list-decimal list-inside space-y-1 ml-4">{TXT.pickupSteps.map(s => <li key={s.en}>{render(s, { inline: true, secondaryClassName: "text-muted-foreground" })}</li>)}</ol></div></div><Separator /><div><h4 className="font-semibold mb-3 flex items-center gap-2"><Badge variant="outline">{badge(TXT.hubBadge)}</Badge>{render(TXT.hubTitle, { inline: true })}</h4><div className="space-y-2 text-sm"><p><strong>{render({ en: "When:", my: "အချိန်:" }, { inline: true })}</strong> {render(TXT.hubWhen, { inline: true, secondaryClassName: "text-muted-foreground" })}</p><p><strong>{render({ en: "Who:", my: "တာဝန်ရှိသူ:" }, { inline: true })}</strong> {render(TXT.hubWho, { inline: true, secondaryClassName: "text-muted-foreground" })}</p><p><strong>{render({ en: "Process:", my: "လုပ်ငန်းစဉ်:" }, { inline: true })}</strong></p><ol className="list-decimal list-inside space-y-1 ml-4">{TXT.hubSteps.map(s => <li key={s.en}>{render(s, { inline: true, secondaryClassName: "text-muted-foreground" })}</li>)}</ol></div></div><Separator /><div><h4 className="font-semibold mb-3 flex items-center gap-2"><Badge variant="outline">{badge(TXT.deliveryBadge)}</Badge>{render(TXT.deliveryTitle, { inline: true })}</h4><div className="space-y-2 text-sm"><p><strong>{render({ en: "When:", my: "အချိန်:" }, { inline: true })}</strong> {render(TXT.deliveryWhen, { inline: true, secondaryClassName: "text-muted-foreground" })}</p><p><strong>{render({ en: "Who:", my: "တာဝန်ရှိသူ:" }, { inline: true })}</strong> {render(TXT.deliveryWho, { inline: true, secondaryClassName: "text-muted-foreground" })}</p><p><strong>{render({ en: "Process:", my: "လုပ်ငန်းစဉ်:" }, { inline: true })}</strong></p><ol className="list-decimal list-inside space-y-1 ml-4">{TXT.deliverySteps.map(s => <li key={s.en}>{render(s, { inline: true, secondaryClassName: "text-muted-foreground" })}</li>)}</ol></div></div></CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5" />{render(TXT.podTitle, { inline: true })}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-3 gap-4"><div className="space-y-2"><h4 className="font-semibold flex items-center gap-2"><Camera className="h-4 w-4" />{render(TXT.signatureTitle, { inline: true })}</h4><p className="text-sm text-muted-foreground">{render(TXT.signatureBody)}</p></div><div className="space-y-2"><h4 className="font-semibold flex items-center gap-2"><Smartphone className="h-4 w-4" />{render(TXT.otpTitle, { inline: true })}</h4><p className="text-sm text-muted-foreground">{render(TXT.otpBody)}</p></div><div className="space-y-2"><h4 className="font-semibold flex items-center gap-2"><Camera className="h-4 w-4" />{render(TXT.photoTitle, { inline: true })}</h4><p className="text-sm text-muted-foreground">{render(TXT.photoBody)}</p></div></div><div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-semibold mb-2">{render(TXT.podBestTitle, { inline: true })}</h4><ul className="text-sm space-y-1">{TXT.podBest.map(p => <li key={p.en}>• {render(p, { inline: true, secondaryClassName: "text-slate-600" })}</li>)}</ul></div></CardContent></Card>

        <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />{render(TXT.exceptionTitle, { inline: true })}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="grid md:grid-cols-2 gap-4"><div><h4 className="font-semibold mb-2">{render(TXT.exceptionCommonTitle, { inline: true })}</h4><ul className="text-sm space-y-1">{TXT.exceptionCommon.map(e => <li key={e.en}>• {render(e, { inline: true, secondaryClassName: "text-muted-foreground" })}</li>)}</ul></div><div><h4 className="font-semibold mb-2">{render(TXT.exceptionProcessTitle, { inline: true })}</h4><ol className="text-sm space-y-1 list-decimal list-inside">{TXT.exceptionSteps.map(s => <li key={s.en}>{render(s, { inline: true, secondaryClassName: "text-muted-foreground" })}</li>)}</ol></div></div></CardContent></Card>
      </div>
    </div>
  );
}
