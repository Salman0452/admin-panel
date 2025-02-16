"use client"
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/custom/Sidebar";
import Navbar from "@/components/custom/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

type User = { id: number; email: string; password: string };

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false); // Add auth state
  const router = useRouter();

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*").returns<User[]>();
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data?? []); // If data is null, set an empty array
    }
    setLoading(false);
    NProgress.done();
  };

  useEffect(() => {
    NProgress.start();
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      } else {
        setAuthenticated(true);
        fetchUsers();
      }
    };

    checkAuth();
  }, [router]);

  if (!authenticated) return null; // Show nothing until authentication is checked

  if (loading) {
    console.log("Loading...");
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>User List</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">ID</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Password</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border">
                      <td className="p-2">{user.id}</td>
                      <td className="p-2">{user.email}</td>
                      <td className="p-2">{user.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
