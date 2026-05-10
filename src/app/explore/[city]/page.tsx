"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Camera, Utensils, Landmark, Calendar } from "lucide-react";
import Image from "next/image";

const cityData: Record<string, {
  photos: string[];
  destinations: string[];
  food: string[];
  culture: string[];
  description: string;
}> = {
  "Tokyo": {
    description: "Experience the perfect blend of neon-lit futurism and timeless tradition in Japan's bustling capital.",
    photos: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80"
    ],
    destinations: ["Shibuya Crossing", "Tokyo Tower", "Senso-ji Temple", "Harajuku Street"],
    food: ["Tsukiji Market Sushi", "Ichiran Ramen", "Street Takoyaki", "Matcha Sweets"],
    culture: ["Tea Ceremonies", "Sumo Wrestling Practice", "Kabuki Theater", "Anime & Gaming Hubs"]
  },
  "Kyoto": {
    description: "Step back in time in the cultural heart of Japan, home to thousands of classical Buddhist temples and Shinto shrines.",
    photos: [
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80",
      "https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2019/01/10105253/Kyoto-Japan-Hero-Image-1600x900.jpg",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80"
    ],
    destinations: ["Fushimi Inari Shrine", "Kinkaku-ji (Golden Pavilion)", "Arashiyama Bamboo Grove", "Gion District"],
    food: ["Kyoto Kaiseki Dining", "Yuba (Tofu Skin)", "Uji Matcha", "Obanzai Ryori"],
    culture: ["Geisha Culture", "Traditional Gardens", "Zen Meditation", "Annual Gion Matsuri"]
  },
  "Barcelona": {
    description: "A vibrant Mediterranean capital known for its unique Gaudí architecture, bustling markets, and world-class culinary scene.",
    photos: [
      "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80"
    ],
    destinations: ["La Sagrada Familia", "Park Guell", "Las Ramblas", "Gothic Quarter"],
    food: ["Paella on the Beach", "Boqueria Market Tapas", "Crema Catalana", "Cava Wine Tasting"],
    culture: ["Castells (Human Towers)", "Flamenco Shows", "Sant Jordi Festival", "Modernisme Architecture Walks"]
  },
  "Lisbon": {
    description: "Explore the sun-drenched hills of Lisbon, the fairytale palaces of Sintra, and the rugged Atlantic coastline.",
    photos: [
      "https://images.unsplash.com/photo-1501927023255-9063be98970c?auto=format&fit=crop&w=800&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Lisbon_%2836211708233%29_%28cropped%29.jpg/1280px-Lisbon_%2836211708233%29_%28cropped%29.jpg",
      "https://www.livelikeitstheweekend.com/wp-content/uploads/2018/09/Lisbon-Portugal-guide.jpg"
    ],
    destinations: ["Belem Tower", "Pena Palace in Sintra", "Alfama District", "Cascais Beaches"],
    food: ["Pastéis de Nata", "Salted Cod (Bacalhau)", "Ginjinha Liqueur", "Grilled Sardines"],
    culture: ["Fado Music Performances", "Azulejo Tile Workshops", "Feira da Ladra Market", "Santos Populares Festivals"]
  },
  "Tokyo To Kyoto": {
    description: "Experience the perfect blend of neon-lit futurism and timeless tradition across Japan's two most iconic cities.",
    photos: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1478338173528-941f35bc45f2?auto=format&fit=crop&w=800&q=80"
    ],
    destinations: ["Shibuya Crossing", "Fushimi Inari Shrine", "Arashiyama Bamboo Grove", "Tokyo Tower"],
    food: ["Tsukiji Market Sushi", "Ichiran Ramen", "Kyoto Kaiseki Dining", "Street Takoyaki"],
    culture: ["Tea Ceremonies", "Sumo Wrestling Practice", "Kabuki Theater", "Zen Temple Meditation"]
  },
  "Lisbon Coast": {
    description: "Explore the sun-drenched hills of Lisbon, the fairytale palaces of Sintra, and the rugged Atlantic coastline.",
    photos: [
      "https://images.unsplash.com/photo-1501927023255-9063be98970c?auto=format&fit=crop&w=800&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Lisbon_%2836211708233%29_%28cropped%29.jpg/1280px-Lisbon_%2836211708233%29_%28cropped%29.jpg",
      "https://www.livelikeitstheweekend.com/wp-content/uploads/2018/09/Lisbon-Portugal-guide.jpg"
    ],
    destinations: ["Belem Tower", "Pena Palace in Sintra", "Alfama District", "Cascais Beaches"],
    food: ["Pastéis de Nata", "Salted Cod (Bacalhau)", "Ginjinha Liqueur", "Grilled Sardines"],
    culture: ["Fado Music Performances", "Azulejo Tile Workshops", "Feira da Ladra Market", "Santos Populares Festivals"]
  },
  "Barcelona City Break": {
    description: "A vibrant Mediterranean capital known for its unique Gaudí architecture, bustling markets, and world-class culinary scene.",
    photos: [
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583779457094-0ddcf33ca94c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=800&q=80"
    ],
    destinations: ["La Sagrada Familia", "Park Guell", "Las Ramblas", "Gothic Quarter"],
    food: ["Paella on the Beach", "Boqueria Market Tapas", "Crema Catalana", "Cava Wine Tasting"],
    culture: ["Castells (Human Towers)", "Flamenco Shows", "Sant Jordi Festival", "Modernisme Architecture Walks"]
  },
  "Golden Triangle": {
    description: "The classic introduction to India, covering the historic streets of Delhi, the Taj Mahal in Agra, and the Pink City of Jaipur.",
    photos: [
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897856741?auto=format&fit=crop&w=800&q=80"
    ],
    destinations: ["The Taj Mahal", "Amber Fort", "Humayun's Tomb", "Hawa Mahal"],
    food: ["Old Delhi Street Food", "Rajasthani Thali", "Mughlai Curries", "Masala Chai"],
    culture: ["Holi Festival Colors", "Bazaar Shopping", "Puppet Shows", "Varanasi Spiritual Tours"]
  },
  "Alpine Rail Loop": {
    description: "Journey through the heart of the Alps via scenic rail, from turquoise lakes to snow-capped peaks and Italian fashion capitals.",
    photos: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516483642144-7f1007ca0b95?auto=format&fit=crop&w=800&q=80"
    ],
    destinations: ["Jungfraujoch Peak", "Lake Lucerne", "Milan Duomo", "Zermatt Village"],
    food: ["Swiss Fondue", "Italian Risotto", "Alpine Chocolate", "Glacier Express Dining"],
    culture: ["Alphorn Performances", "Swiss Watchmaking", "Milan Fashion Week", "Lakeside Orchestras"]
  },
  "New York Weekend": {
    description: "The city that never sleeps. Explore Manhattan's towering skyscrapers, Central Park's greenery, and Brooklyn's creative energy.",
    photos: [
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534430480872-3498386e7a0b?auto=format&fit=crop&w=800&q=80"
    ],
    destinations: ["Empire State Building", "Central Park", "Times Square", "Brooklyn Bridge"],
    food: ["NY Style Pizza", "Bagels and Lox", "Street Cart Pretzels", "Fine Dining in Chelsea"],
    culture: ["Broadway Shows", "Museum Mile (MET/MoMA)", "Jazz Clubs in Greenwich Village", "Fashion District"]
  }
};

const fallbacks = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", // Nature
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80", // Travel
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80"  // Map/Travel items
];

export default function ExploreCityPage() {
  const params = useParams();
  const city = decodeURIComponent(params.city as string);
  const data = cityData[city];

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#16191d] text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">City Not Found</h1>
          <Link href="/" className="mt-4 inline-block text-teal-400 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#16191d] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101216]/95 backdrop-blur px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white/70 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to Voyage
          </Link>
          <h1 className="font-serif text-xl font-semibold italic text-white">{city}</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Description */}
        <p className="mb-12 text-center font-serif text-2xl font-light italic leading-relaxed text-white/90">
          "{data.description}"
        </p>

        {/* Photos Grid */}
        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <Camera className="h-5 w-5 text-teal-400" />
            <h2 className="text-lg font-semibold uppercase tracking-widest text-white/50">Gallery</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {data.photos.map((url, i) => (
              <div key={i} className="group relative aspect-[4/3] overflow-hidden border border-white/10 bg-white/5">
                <Image
                  src={url}
                  alt={`${city} photo ${i + 1}`}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const currentIdx = parseInt(target.getAttribute("data-fallback-idx") || "0");
                    if (currentIdx < fallbacks.length) {
                      target.src = fallbacks[currentIdx];
                      target.setAttribute("data-fallback-idx", (currentIdx + 1).toString());
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-12 sm:grid-cols-3">
          {/* Destinations */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Landmark className="h-5 w-5 text-teal-400" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">Top Spots</h2>
            </div>
            <ul className="space-y-4">
              {data.destinations.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-white/80">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500/50" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Food */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Utensils className="h-5 w-5 text-teal-400" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">Local Flavors</h2>
            </div>
            <ul className="space-y-4">
              {data.food.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-white/80">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500/50" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Culture */}
          <section>
            <div className="mb-6 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-teal-400" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">Culture</h2>
            </div>
            <ul className="space-y-4">
              {data.culture.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-medium text-white/80">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500/50" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
