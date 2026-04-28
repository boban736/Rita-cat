import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ритка — трекер кормления",
    short_name: "Ритка",
    description: "Трекер кормления кошки",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#181512",
    theme_color: "#181512",
    icons: [
      {
        src: "/apple-touch-icon.jpg",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
  };
}
