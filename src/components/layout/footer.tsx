export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-gold-500/20 py-6">
      <p className="text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Britium Express. All rights reserved.
      </p>
    </footer>
  );
}