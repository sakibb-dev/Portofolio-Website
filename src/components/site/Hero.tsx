import type { Hero as HeroData } from "@/lib/types";
import { colorClass, withMarks } from "@/lib/text";

export function Hero({ hero }: { hero: HeroData }) {
  return (
    <section className="hero nb-grid" style={{ borderTop: 0 }}>
      <div className="wrap hero__grid">
        <div>
          <span className={colorClass("nb-tag", hero.tag_color)}>{hero.tag_text}</span>
          <h1>{withMarks(hero.title)}</h1>
          <p className="lead">{hero.lead}</p>
          <div className="cta">
            <a className="nb-btn nb-btn--lg" href={hero.btn1_href}>
              {hero.btn1_label}
            </a>
            <a className="nb-btn nb-btn--lg nb-btn--plain" href={hero.btn2_href}>
              {hero.btn2_label}
            </a>
          </div>
          {hero.note && <p className="note">{hero.note}</p>}
        </div>
        <div className="art" aria-hidden="true">
          <div className="art__b art__b--t"></div>
          <div className="art__b art__b--c"></div>
          <span className="nb-tag nb-tag--yellow nb-sticker">{hero.sticker_text}</span>
          <div className="win">
            <div className="win__bar">
              <i></i>
              <i></i>
              <i></i>
            </div>
            <div className="win__body">
              <b>{hero.window_title}</b>
              <div className="win__line" style={{ width: "100%" }}></div>
              <div className="win__line" style={{ width: "82%" }}></div>
              <div className="win__line" style={{ width: "54%" }}></div>
              <span className="nb-btn nb-btn--sm">{hero.window_button}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
