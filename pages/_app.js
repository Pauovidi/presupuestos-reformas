import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-100">
        <div className="container flex items-center justify-between py-4">
          <div className="font-bold text-xl">🧮 Calculadora Reformas</div>
          <a
            href="#"
            className="text-sm text-gray-600 hover:text-black"
            onClick={(e) => e.preventDefault()}
          >
            {/* En v5 había un link; lo dejamos como placeholder */}
            &nbsp;
          </a>
        </div>
      </header>

      <main className="container py-6">
        <Component {...pageProps} />
      </main>

      <footer className="container py-10 text-center text-sm text-gray-500">
        Hecha con Next.js + Tailwind
      </footer>
    </div>
  );
}
