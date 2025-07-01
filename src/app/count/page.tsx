"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

type Counts = {
  vishnuSahasranama: number;
  lalithaSahasranama: number;
  durgaSaptashati: number;
  navarnaCount: number;
};

export default function Count() {
  const { data: session } = useSession();
  const router = useRouter();
  const [counts, setCounts] = useState<Counts>({
    vishnuSahasranama: 0,
    lalithaSahasranama: 0,
    durgaSaptashati: 0,
    navarnaCount: 0,
  });
  const [editing, setEditing] = useState<keyof typeof counts | null>(null);
  const [inputCount, setInputCount] = useState("");
  const [analytics, setAnalytics] = useState<{
    totalUsers: number;
    totalCounts: number;
    byPractice: {
      navarna: number;
      vishnuSahasranama: number;
      lalithaSahasranama: number;
      durgaSaptashati: number;
    };
  } | null>(null);
  
  const email = session?.user?.email;

  useEffect(() => {
    if (!session) {
      router.push("/signin");
    }
  }, [session, router]);

  useEffect(() => {
    if (!session) return;

    async function fetchUserCounts() {
      try {
        const [userResponse, analyticsResponse] = await Promise.all([
          axios.post("/api/users/me", { email }),
          axios.get("/api/analytics/top-users"),
        ]);

        // Check if profile is complete
        if (!userResponse.data.name || !userResponse.data.mobile) {
          router.push('/profile/complete');
          return;
        }

        setCounts({
          vishnuSahasranama: userResponse.data.vishnuSahasranama || 0,
          lalithaSahasranama: userResponse.data.lalithaSahasranama || 0,
          durgaSaptashati: userResponse.data.durgaSaptashati || 0,
          navarnaCount: userResponse.data.navarnaCount || 0,
        });

        if (analyticsResponse.data?.success) {
          setAnalytics(analyticsResponse.data.metrics);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchUserCounts();
  }, [session, email]);

  const startEditing = (type: keyof typeof counts) => {
    setEditing(type);
    setInputCount(counts[type].toString());
  };

  const cancelEditing = () => {
    setEditing(null);
    setInputCount("");
  };

  const saveCount = async (type: keyof typeof counts) => {
    const newCount = parseInt(inputCount, 10);
    if (isNaN(newCount) || newCount < 0) {
      alert("Please enter a valid non-negative number");
      return;
    }

    try {
      await axios.post("/api/users/update", {
        email: email,
        type: type,
        count: newCount,
      });

      setCounts((prev) => ({
        ...prev,
        [type]: newCount,
      }));

      cancelEditing();
    } catch (error) {
      console.error("Error updating count:", error);
      alert("Failed to update count. Please try again.");
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg mb-4 md:mb-6">
          <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl text-white font-bold text-center py-4 px-2 sm:py-5 sm:px-3 md:py-6 md:px-4">
            Sri Ramakrishna Vivekananda Ashrama, Kalaburagi
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-4 p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-orange-600 mb-4">
            Welcome{" "}
            <span className="text-blue-600">{session?.user?.email}</span>
          </h2>
          <p className="text-md text-gray-600">
            Sri Ramakrishna Vivekananda Ashrama, Kalaburagi, will host the Sri
            Ayuta Chandika Mahayaga from November 25th-28th, with a sacred
            resolution for world peace and prosperity. Join the powerful
            sankalpa of 10,000 Chandi Parayanas, 1 crore Navarna Japa, and 1
            lakh Vishnu & Lalitha Sahasranama recitations. Participate from
            wherever you are and be a part of this divine offering.
          </p>
          <br />
          <a href="https://chat.whatsapp.com/LEY0027ZJiZHgz45aDS4Xs" target="_blank" className="text-blue-600 hover:underline font-bold">
            Click here to join our WhatsApp community
          </a>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-6 p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-orange-600">
            Personal Progress :
          </h2>
        </div>

        {/* User Stats Card */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {[
            {
              id: "vishnuSahasranama",
              name: "Vishnu Sahasranama",
              color: "from-blue-500 to-blue-600",
            },
            {
              id: "lalithaSahasranama",
              name: "Lalitha Sahasranama",
              color: "from-purple-500 to-purple-600",
            },
            {
              id: "durgaSaptashati",
              name: "Durga Saptashati",
              color: "from-red-500 to-red-600",
            },
            {
              id: "navarnaCount",
              name: "Navarna Japa",
              color: "from-green-500 to-green-600",
            },
          ].map((item) => {
            const isEditing = editing === item.id;
            const count = counts[item.id as keyof typeof counts];
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.name}
                </h3>

                {isEditing ? (
                  <div className="mb-4">
                    <input
                      type="number"
                      min="0"
                      value={inputCount}
                      onChange={(e) => setInputCount(e.target.value)}
                      className="w-full p-2 border rounded-lg text-2xl font-bold text-center"
                      autoFocus
                    />
                  </div>
                ) : (
                  <p className="text-3xl font-bold mb-4">{count}</p>
                )}

                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => saveCount(item.id as keyof typeof counts)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing(item.id as keyof typeof counts)}
                    className={`w-full bg-gradient-to-r ${item.color} text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition`}
                  >
                    Update Count
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-blue-100">
            <h2 className="text-xl font-bold text-orange-600 mb-4">
              Overall Community Progress
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="text-blue-800 font-semibold mb-2">
                Total Participants
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {analytics.totalUsers.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="text-emerald-800 font-semibold mb-2">
                  Durga Saptashati
                </h3>
                <p className="text-2xl font-bold text-emerald-600">
                  {analytics.byPractice.durgaSaptashati.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-purple-800 font-semibold mb-2">
                  Navarna Japa
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.byPractice.navarna.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-amber-800 font-semibold mb-2">
                  Vishnu Sahasranama
                </h3>
                <p className="text-2xl font-bold text-amber-600">
                  {analytics.byPractice.vishnuSahasranama.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-rose-50 p-4 rounded-lg">
                <h3 className="text-rose-800 font-semibold mb-2">
                  Lalitha Sahasranama
                </h3>
                <p className="text-2xl font-bold text-rose-600">
                  {analytics.byPractice.lalithaSahasranama.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
