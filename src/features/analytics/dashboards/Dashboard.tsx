import RealTimeMapView from '@/components/RealTimeMapView';
import RevenueForecast from '@/components/RevenueForecast';

export default function Dashboard() {
  return (
    <section className="py-10 px-6 max-w-7xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Operations Dashboard</h1>

      <RealTimeMapView />

      <div className="grid md:grid-cols-2 gap-8">
        <RevenueForecast />
      </div>
    </section>
  );
}