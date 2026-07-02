// First-run demo content per collection. Used only when a collection is empty
// in the active adapter, so real data is never overwritten.
const uid = () => Math.random().toString(36).slice(2, 9);

// Dates relative to the viewer's "today" (yyyy-mm-dd), so demo events always
// look upcoming and don't get auto-deleted for being in the past.
const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export function seedFor(name) {
  switch (name) {
    case "events":
      return [
        { id: uid(), title: "Sunday Service", date: dayOffset(3), time: "10:00", location: "Main Hall" },
        { id: uid(), title: "Youth Group", date: dayOffset(6), time: "18:30", location: "Annex B" },
      ];
    case "announcements":
      return [
        { id: uid(), title: "Welcome!", body: "New here? Stop by the welcome desk after service.", pinned: true },
      ];
    case "prayer":
      return [
        { id: uid(), name: "Anonymous", request: "Healing for my family.", answered: false },
      ];
    case "directory":
      return [
        {
          id: uid(), name: "Maria Lopez", role: "Worship", email: "maria@grace.org",
          phone: "(555) 123-4567", birthday: "1990-04-12", anniversary: "2015-06-20",
          household: "Married to Carlos; kids Ana & Leo", address: "12 Oak St, Springfield",
          joined: "2016-09-01", baptized: "2016-11-13", notes: "",
        },
      ];
    case "leadership":
      return [
        { id: uid(), name: "Pastor Dan", title: "Lead Pastor", email: "dan@grace.org", bio: "Serving the church since 2012." },
        { id: uid(), name: "Maria Lopez", title: "Worship Director", email: "maria@grace.org", bio: "" },
      ];
    case "sermons":
      return [
        { id: uid(), title: "The Good Shepherd", speaker: "Pastor Dan", date: dayOffset(-7), link: "" },
      ];
    case "groups":
      return [
        { id: uid(), name: "Young Adults", schedule: "Wed 7pm", leader: "Maria Lopez", contact: "maria@grace.org", description: "20s–30s community group." },
      ];
    case "meals":
      return [
        {
          id: uid(),
          title: "Sunday Potluck",
          date: dayOffset(5),
          location: "Fellowship Hall",
          signups: [{ name: "Maria Lopez", dish: "Green salad" }],
        },
      ];
    default:
      return [];
  }
}
