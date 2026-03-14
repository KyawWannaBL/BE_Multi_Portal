import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
}

interface SignatureRequest {
  parcel_id: string
  shipment_id?: string
  signature_data: string // Base64 encoded signature
  signature_points?: Array<{x: number, y: number, timestamp: number}>
  signer_name: string
  signer_phone?: string
  signer_id_type?: string
  signer_id_number?: string
  relationship_to_recipient?: string
  delivery_rider_id: string
  delivery_location: {
    latitude: number
    longitude: number
    address?: string
  }
  delivery_notes?: string
  recipient_photo?: string // Base64 encoded photo
  package_photo?: string // Base64 encoded photo
  location_photo?: string // Base64 encoded photo
  device_info?: any
}

interface DataEntryRequest {
  source_type: 'QR_SCAN' | 'BARCODE_SCAN' | 'OCR_DOCUMENT' | 'VOICE_INPUT'
  source_data: string
  source_file?: string // Base64 encoded file
  target_table?: string
  auto_apply?: boolean
}

interface OCRResult {
  text: string
  confidence: number
  fields: Record<string, any>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'signature'

    if (req.method === 'POST' && action === 'signature') {
      // Process electronic signature
      const signatureRequest: SignatureRequest = await req.json()

      if (!signatureRequest.parcel_id || !signatureRequest.signature_data || !signatureRequest.signer_name) {
        return new Response(
          JSON.stringify({ error: 'Missing required signature data' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate signature hash for verification
      const signatureHash = await generateSignatureHash(signatureRequest.signature_data)

      // Upload photos to Supabase Storage if provided
      const photoUrls: Record<string, string> = {}
      
      if (signatureRequest.recipient_photo) {
        photoUrls.recipient_photo_url = await uploadPhoto(
          supabaseClient, 
          signatureRequest.recipient_photo, 
          `signatures/${signatureRequest.parcel_id}/recipient.jpg`
        )
      }
      
      if (signatureRequest.package_photo) {
        photoUrls.package_photo_url = await uploadPhoto(
          supabaseClient, 
          signatureRequest.package_photo, 
          `signatures/${signatureRequest.parcel_id}/package.jpg`
        )
      }
      
      if (signatureRequest.location_photo) {
        photoUrls.location_photo_url = await uploadPhoto(
          supabaseClient, 
          signatureRequest.location_photo, 
          `signatures/${signatureRequest.parcel_id}/location.jpg`
        )
      }

      // Insert signature record
      const { data: signature, error: signatureError } = await supabaseClient
        .from('electronic_signatures_2026_02_18_18_00')
        .insert({
          parcel_id: signatureRequest.parcel_id,
          shipment_id: signatureRequest.shipment_id,
          signature_data: signatureRequest.signature_data,
          signature_hash: signatureHash,
          signature_points: signatureRequest.signature_points,
          signer_name: signatureRequest.signer_name,
          signer_phone: signatureRequest.signer_phone,
          signer_id_type: signatureRequest.signer_id_type,
          signer_id_number: signatureRequest.signer_id_number,
          relationship_to_recipient: signatureRequest.relationship_to_recipient || 'SELF',
          delivery_rider_id: signatureRequest.delivery_rider_id,
          delivery_location: signatureRequest.delivery_location,
          delivery_timestamp: new Date().toISOString(),
          delivery_notes: signatureRequest.delivery_notes,
          device_info: signatureRequest.device_info,
          ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          user_agent: req.headers.get('user-agent'),
          ...photoUrls
        })
        .select()
        .single()

      if (signatureError) {
        throw new Error(`Failed to save signature: ${signatureError.message}`)
      }

      // Validate signature quality
      const { data: validationResult, error: validationError } = await supabaseClient
        .rpc('validate_signature_2026_02_18_18_00', {
          p_signature_id: signature.id
        })

      if (validationError) {
        console.error('Signature validation failed:', validationError)
      }

      // Update parcel status to delivered
      await supabaseClient
        .from('parcels_2026_02_18_17_00')
        .update({
          status: 'DELIVERED',
          delivered_at: new Date().toISOString(),
          signature_id: signature.id
        })
        .eq('parcel_id', signatureRequest.parcel_id)

      // Create real-time event
      await supabaseClient
        .from('realtime_events_2026_02_18_18_00')
        .insert({
          event_type: 'SIGNATURE_CAPTURED',
          entity_type: 'PARCEL',
          entity_id: signatureRequest.parcel_id,
          event_data: {
            signer_name: signatureRequest.signer_name,
            delivery_rider_id: signatureRequest.delivery_rider_id,
            quality_score: validationResult?.quality_score,
            is_verified: validationResult?.is_verified
          },
          location: {
            lat: signatureRequest.delivery_location.latitude,
            lng: signatureRequest.delivery_location.longitude
          },
          priority: 'NORMAL'
        })

      return new Response(
        JSON.stringify({
          success: true,
          signature_id: signature.id,
          validation_result: validationResult,
          photo_urls: photoUrls,
          message: 'Electronic signature captured successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST' && action === 'data-entry') {
      // Process automated data entry
      const dataRequest: DataEntryRequest = await req.json()

      if (!dataRequest.source_type || !dataRequest.source_data) {
        return new Response(
          JSON.stringify({ error: 'Missing required data entry information' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const startTime = Date.now()
      let extractedFields: Record<string, any> = {}
      let confidenceScore = 0
      let processingMethod = 'MANUAL'

      // Process based on source type
      switch (dataRequest.source_type) {
        case 'QR_SCAN':
          const qrResult = processQRCode(dataRequest.source_data)
          extractedFields = qrResult.fields
          confidenceScore = qrResult.confidence
          processingMethod = 'REGEX'
          break

        case 'BARCODE_SCAN':
          const barcodeResult = processBarcode(dataRequest.source_data)
          extractedFields = barcodeResult.fields
          confidenceScore = barcodeResult.confidence
          processingMethod = 'REGEX'
          break

        case 'OCR_DOCUMENT':
          if (dataRequest.source_file) {
            const ocrResult = await processOCRDocument(dataRequest.source_file)
            extractedFields = ocrResult.fields
            confidenceScore = ocrResult.confidence
            processingMethod = 'ML_MODEL'
          }
          break

        case 'VOICE_INPUT':
          const voiceResult = processVoiceInput(dataRequest.source_data)
          extractedFields = voiceResult.fields
          confidenceScore = voiceResult.confidence
          processingMethod = 'API_LOOKUP'
          break
      }

      // Validate extracted fields
      const validationResults = validateExtractedFields(extractedFields, dataRequest.target_table)
      const requiresReview = confidenceScore < 80 || validationResults.hasErrors

      // Insert data entry record
      const { data: dataEntry, error: dataEntryError } = await supabaseClient
        .from('data_entry_automation_2026_02_18_18_00')
        .insert({
          source_type: dataRequest.source_type,
          source_data: dataRequest.source_data,
          source_file_url: dataRequest.source_file ? await uploadFile(supabaseClient, dataRequest.source_file, `data-entry/${Date.now()}.jpg`) : null,
          processing_method: processingMethod,
          confidence_score: confidenceScore,
          processing_time_ms: Date.now() - startTime,
          extracted_fields: extractedFields,
          validation_results: validationResults,
          target_table: dataRequest.target_table,
          auto_applied: false,
          requires_review: requiresReview,
          status: requiresReview ? 'PENDING' : 'PROCESSED'
        })
        .select()
        .single()

      if (dataEntryError) {
        throw new Error(`Failed to save data entry: ${dataEntryError.message}`)
      }

      // Auto-apply if confidence is high and no validation errors
      let targetRecordId = null
      if (dataRequest.auto_apply && !requiresReview && dataRequest.target_table) {
        try {
          const applyResult = await autoApplyData(supabaseClient, extractedFields, dataRequest.target_table)
          if (applyResult.success) {
            targetRecordId = applyResult.record_id
            
            // Update data entry record
            await supabaseClient
              .from('data_entry_automation_2026_02_18_18_00')
              .update({
                target_record_id: targetRecordId,
                auto_applied: true,
                status: 'APPLIED'
              })
              .eq('id', dataEntry.id)
          }
        } catch (error) {
          console.error('Auto-apply failed:', error)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          data_entry_id: dataEntry.id,
          extracted_fields: extractedFields,
          confidence_score: confidenceScore,
          validation_results: validationResults,
          requires_review: requiresReview,
          auto_applied: !!targetRecordId,
          target_record_id: targetRecordId,
          processing_time_ms: Date.now() - startTime
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET' && action === 'signatures') {
      // Get signatures for a parcel or rider
      const parcelId = url.searchParams.get('parcel_id')
      const riderId = url.searchParams.get('rider_id')
      const limit = parseInt(url.searchParams.get('limit') || '50')

      let query = supabaseClient
        .from('electronic_signatures_2026_02_18_18_00')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (parcelId) {
        query = query.eq('parcel_id', parcelId)
      }
      if (riderId) {
        query = query.eq('delivery_rider_id', riderId)
      }

      const { data: signatures, error: signaturesError } = await query

      if (signaturesError) {
        throw new Error(`Failed to fetch signatures: ${signaturesError.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          signatures: signatures,
          count: signatures?.length || 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Signature processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper functions
async function generateSignatureHash(signatureData: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(signatureData)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function uploadPhoto(supabaseClient: any, photoData: string, path: string): Promise<string> {
  try {
    // Convert base64 to blob
    const base64Data = photoData.replace(/^data:image\/[a-z]+;base64,/, '')
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    
    const { data, error } = await supabaseClient.storage
      .from('signatures')
      .upload(path, binaryData, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (error) {
      throw error
    }

    const { data: urlData } = supabaseClient.storage
      .from('signatures')
      .getPublicUrl(path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Photo upload failed:', error)
    return ''
  }
}

async function uploadFile(supabaseClient: any, fileData: string, path: string): Promise<string> {
  try {
    const base64Data = fileData.replace(/^data:[^;]+;base64,/, '')
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
    
    const { data, error } = await supabaseClient.storage
      .from('documents')
      .upload(path, binaryData, {
        upsert: true
      })

    if (error) {
      throw error
    }

    const { data: urlData } = supabaseClient.storage
      .from('documents')
      .getPublicUrl(path)

    return urlData.publicUrl
  } catch (error) {
    console.error('File upload failed:', error)
    return ''
  }
}

function processQRCode(qrData: string): { fields: Record<string, any>, confidence: number } {
  // Parse QR code data (e.g., YGN119874YGN format)
  const parcelIdPattern = /^([A-Z]{3})(\d{6})([A-Z]{3})$/
  const match = qrData.match(parcelIdPattern)
  
  if (match) {
    return {
      fields: {
        parcel_id: qrData,
        pickup_zone: match[1],
        sequence_number: match[2],
        delivery_zone: match[3],
        type: 'parcel_tracking'
      },
      confidence: 95
    }
  }

  // Try other QR formats
  try {
    const jsonData = JSON.parse(qrData)
    return {
      fields: jsonData,
      confidence: 90
    }
  } catch {
    return {
      fields: { raw_data: qrData },
      confidence: 50
    }
  }
}

function processBarcode(barcodeData: string): { fields: Record<string, any>, confidence: number } {
  // Process different barcode formats
  if (barcodeData.length === 12 || barcodeData.length === 13) {
    // UPC/EAN format
    return {
      fields: {
        product_code: barcodeData,
        type: 'product_barcode'
      },
      confidence: 95
    }
  }

  return {
    fields: { raw_data: barcodeData },
    confidence: 70
  }
}

async function processOCRDocument(fileData: string): Promise<OCRResult> {
  // Simulate OCR processing (in real implementation, use Google Vision API, Tesseract, etc.)
  // For demo purposes, return mock data
  return {
    text: 'Sample OCR extracted text',
    confidence: 85,
    fields: {
      document_type: 'invoice',
      amount: '150000',
      date: '2026-02-18',
      reference_number: 'INV-2026-001'
    }
  }
}

function processVoiceInput(voiceData: string): { fields: Record<string, any>, confidence: number } {
  // Simulate voice processing (in real implementation, use speech-to-text API)
  return {
    fields: {
      transcription: voiceData,
      type: 'voice_note'
    },
    confidence: 75
  }
}

function validateExtractedFields(fields: Record<string, any>, targetTable?: string): any {
  const validationResults = {
    hasErrors: false,
    errors: [] as string[],
    warnings: [] as string[],
    field_validations: {} as Record<string, any>
  }

  // Basic validation rules
  for (const [key, value] of Object.entries(fields)) {
    const fieldValidation = { valid: true, errors: [] as string[] }

    if (key.includes('phone') && value) {
      const phonePattern = /^09\d{8,9}$/
      if (!phonePattern.test(value.toString())) {
        fieldValidation.valid = false
        fieldValidation.errors.push('Invalid Myanmar phone number format')
        validationResults.hasErrors = true
      }
    }

    if (key.includes('email') && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(value.toString())) {
        fieldValidation.valid = false
        fieldValidation.errors.push('Invalid email format')
        validationResults.hasErrors = true
      }
    }

    if (key.includes('amount') && value) {
      const amount = parseFloat(value.toString())
      if (isNaN(amount) || amount < 0) {
        fieldValidation.valid = false
        fieldValidation.errors.push('Invalid amount value')
        validationResults.hasErrors = true
      }
    }

    validationResults.field_validations[key] = fieldValidation
    validationResults.errors.push(...fieldValidation.errors)
  }

  return validationResults
}

async function autoApplyData(supabaseClient: any, fields: Record<string, any>, targetTable: string): Promise<{ success: boolean, record_id?: string }> {
  try {
    // Apply data based on target table
    switch (targetTable) {
      case 'parcels_2026_02_18_17_00':
        if (fields.parcel_id) {
          const { data, error } = await supabaseClient
            .from('parcels_2026_02_18_17_00')
            .update({
              status: 'SCANNED',
              scanned_at: new Date().toISOString(),
              ...fields
            })
            .eq('parcel_id', fields.parcel_id)
            .select()
            .single()

          if (error) throw error
          return { success: true, record_id: data.id }
        }
        break

      case 'customers_2026_02_18_17_00':
        const { data: customer, error: customerError } = await supabaseClient
          .from('customers_2026_02_18_17_00')
          .insert(fields)
          .select()
          .single()

        if (customerError) throw customerError
        return { success: true, record_id: customer.id }

      default:
        throw new Error(`Unsupported target table: ${targetTable}`)
    }

    return { success: false }
  } catch (error) {
    console.error('Auto-apply error:', error)
    return { success: false }
  }
}