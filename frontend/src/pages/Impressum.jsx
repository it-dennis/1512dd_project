export default function Impressum() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Impressum</h1>
        <p className="font-mono text-sm" style={{ color: 'rgba(30,167,88,0.70)' }}>
          Angaben gemäß § 5 TMG
        </p>
      </div>

      <div className="card space-y-8 md-content">
        <section>
          <p className="text-white font-bold mb-1">Dennis Rapp</p>
          <p>Dennis Rapp IT-Agency<br />
          In den Fischergärten 8<br />
          72074 Tübingen</p>
        </section>

        <section>
          <h2>Kontakt</h2>
          <p>
            Telefon: 01746052967<br />
            E-Mail: <a href="mailto:info@dennisrapp.com" className="text-phosphor hover:underline">info@dennisrapp.com</a>
          </p>
        </section>

        <section>
          <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
          <p>
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <p className="text-xs font-mono" style={{ color: 'rgba(170,255,204,0.30)' }}>
          Quelle: <a href="https://www.e-recht24.de/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>e-recht24.de</a>
        </p>
      </div>
    </div>
  );
}
