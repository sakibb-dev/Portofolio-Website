const fmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export const formatDateTime = (iso: string) => fmt.format(new Date(iso));
