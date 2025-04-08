export function Footer() {
  return (
    <footer className="bg-white shadow-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-gray-500">
            © {new Date().getFullYear()} FONIS Quiz. All rights reserved.
          </div>
          <div className="text-gray-500">
            Powered by Firebase Realtime Database
          </div>
        </div>
      </div>
    </footer>
  );
} 