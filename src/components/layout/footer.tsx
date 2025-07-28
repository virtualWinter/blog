export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 mt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-500">
          © {currentYear}
        </div>
      </div>
    </footer>
  );
}