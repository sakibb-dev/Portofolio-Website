export const NB_COLORS = ["yellow", "mint", "tomato", "cobalt", "netral"] as const;
export type NbColor = (typeof NB_COLORS)[number];

export const PROJECT_STATUSES = ["private", "public"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  public: "Open source",
  private: "Private",
};

export type SiteSettings = {
  site_title: string;
  site_description: string;
  brand: string;
  nav_cta_label: string;
  nav_cta_href: string;
  footer_copyright: string;
  cv_path: string | null;
  cv_label: string;
};

export type Hero = {
  tag_text: string;
  tag_color: NbColor;
  title: string;
  lead: string;
  note: string;
  btn1_label: string;
  btn1_href: string;
  btn2_label: string;
  btn2_href: string;
  sticker_text: string;
  window_title: string;
  window_button: string;
};

export type SectionKey = "about" | "journey" | "projects" | "contact";

export type Section = {
  key: SectionKey;
  nav_label: string;
  eyebrow: string;
  heading: string;
  intro: string;
  note: string;
};

type Orderable = { id: string; position: number; visible: boolean };

export type StackItem = Orderable & { label: string };
export type Service = Orderable & { title: string; body: string; color: NbColor };
export type JourneyStep = Orderable & {
  tag_label: string;
  tag_color: NbColor;
  title: string;
  body: string;
};
export type Project = Orderable & {
  title: string;
  description: string;
  tag_label: string;
  tag_color: NbColor;
  github_url: string;
  status: ProjectStatus;
  catatan_status: string;
};
export type SocialLink = Orderable & { label: string; url: string };

export type SiteContent = {
  settings: SiteSettings;
  hero: Hero;
  sections: Record<SectionKey, Section>;
  stack: StackItem[];
  services: Service[];
  journey: JourneyStep[];
  projects: Project[];
  socials: SocialLink[];
};
