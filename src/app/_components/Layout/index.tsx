"use client";
import i18next from "i18next";
import { ReactNode } from "react";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import translation from "zod-i18n-map/locales/ja/zod.json";

void i18next.init({
  lng: "ja",
  resources: {
    ja: { zod: translation },
  },
});

z.setErrorMap(zodI18nMap);

export type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps): JSX.Element {
  return <>{children}</>;
}
