export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="mb-10 inline-block text-sm text-zinc-400 transition hover:text-white"
        >
          ← Înapoi la FollowCheck
        </a>

        <h1 className="text-4xl font-bold tracking-tight">
          Politica de confidențialitate
        </h1>

        <p className="mt-4 text-zinc-400">
          Ultima actualizare: 1 octombrie 2026
        </p>

        <section className="mt-10 space-y-8 text-zinc-300">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Ce face FollowCheck
            </h2>

            <p className="mt-3 leading-7">
              FollowCheck analizează o arhivă de date
              exportată de Instagram și compară lista
              conturilor urmărite cu lista urmăritorilor.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Arhiva Instagram
            </h2>

            <p className="mt-3 leading-7">
              Arhiva încărcată este folosită pentru
              procesarea analizei solicitate de utilizator.
              Aplicația nu are nevoie de parola Instagram
              și nu solicită autentificarea în contul
              Instagram.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Nu cerem parola Instagram
            </h2>

            <p className="mt-3 leading-7">
              FollowCheck nu solicită și nu trebuie să
              primească parola, cookie-urile sau tokenurile
              contului tău Instagram.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Stocarea datelor
            </h2>

            <p className="mt-3 leading-7">
              În versiunea actuală, aplicația nu are o
              bază de date și nu salvează arhivele Instagram
              într-un sistem persistent de stocare.
              Arhiva este transmisă către endpoint-ul de
              analiză pentru procesarea cerută, iar rezultatul
              este returnat browserului.
            </p>

            <p className="mt-3 leading-7">
              Infrastructura de găzduire poate procesa
              metadate tehnice și loguri necesare funcționării
              serviciului. FollowCheck nu folosește aceste
              date pentru a construi un profil al utilizatorului.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Ce rezultate primești
            </h2>

            <p className="mt-3 leading-7">
              Rezultatele analizei sunt afișate în browserul
              tău. Aplicația nu are nevoie să creeze un cont
              pentru utilizator și nu păstrează o listă
              permanentă a rezultatelor.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Securitate
            </h2>

            <p className="mt-3 leading-7">
              FollowCheck limitează dimensiunea arhivelor
              acceptate și numărul de fișiere procesate.
              Sunt analizate doar fișierele Instagram necesare
              pentru comparație.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Contact
            </h2>

            <p className="mt-3 leading-7">
              Pentru întrebări privind confidențialitatea sau
              funcționarea aplicației, poți contacta
              administratorul proiectului prin canalul de
              contact disponibil pe pagina proiectului.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Important
            </h2>

            <p className="mt-3 leading-7">
              FollowCheck este un instrument independent și
              nu este afiliat, sponsorizat sau aprobat de
              Instagram sau Meta.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}