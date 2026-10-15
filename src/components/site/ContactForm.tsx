// Tahap (a): markup statis. Pengiriman (server action + validasi) dipasang di tahap (c).
export function ContactForm() {
  return (
    <form className="nb-card form">
      <div className="nb-field">
        <label className="nb-label" htmlFor="n">
          Nama
        </label>
        <input className="nb-input" id="n" name="nama" placeholder="Nama kamu" />
      </div>
      <div className="nb-field">
        <label className="nb-label" htmlFor="k">
          WhatsApp atau email
        </label>
        <input className="nb-input" id="k" name="kontak" placeholder="08xx atau nama@email.com" />
        <p className="nb-hint">Hanya dipakai untuk membalas pesan ini.</p>
      </div>
      <div className="nb-field">
        <label className="nb-label" htmlFor="b">
          Pesan
        </label>
        <textarea className="nb-input" id="b" name="pesan" placeholder="Ceritakan singkat"></textarea>
      </div>
      <button className="nb-btn nb-btn--tomato nb-btn--lg" type="submit">
        Kirim pesan
      </button>
    </form>
  );
}
