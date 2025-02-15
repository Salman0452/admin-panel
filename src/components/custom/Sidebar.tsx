import Link from "next/link";

export default function Sidebar() {
    return (
      <div className="w-64 bg-gray-800 text-white h-full p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <ul>
          <Link href="/dashboard" className="p-2 block hover:bg-gray-200 rounded">
            Dashboard
          </Link>
          <Link href="/products" className="p-2 block hover:bg-gray-200 rounded">
            Products
          </Link>
        </ul>
      </div>
    );
  }
  