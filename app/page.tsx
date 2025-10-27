import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";

export default function Home() {
  const { hero, activityHighlights, features, theme } = siteConfig;
  const HeroIcon = hero.icon;
  const HighlightsIcon = activityHighlights.icon;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="max-w-4xl space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex justify-center gap-4 text-6xl">
            <span>{hero.emoji[0]}</span>
            <HeroIcon className="h-16 w-16 text-theme-primary" />
            <span>{hero.emoji[1]}</span>
          </div>

          <h1 className="bg-[linear-gradient(to_right,var(--theme-primary),var(--theme-secondary),var(--theme-primary))] bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl">
            {hero.title}
          </h1>

          <p className="text-2xl font-semibold text-primary">
            {hero.subtitle}
          </p>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {hero.description}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {hero.ctaButtons.map((button) => {
            const ButtonIcon = button.icon;
            const isPrimary = button.variant === 'primary';
            
            return (
              <Link
                key={button.href}
                href={button.href}
                className={
                  isPrimary
                    ? "group flex items-center gap-2 rounded-full bg-[linear-gradient(to_right,var(--theme-primary),var(--theme-secondary))] px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                    : "group flex items-center gap-2 rounded-full border-2 border-theme-secondary px-8 py-4 text-lg font-semibold text-theme-secondary shadow-lg transition-all hover:scale-105 hover:bg-theme-secondary-light hover:shadow-xl"
                }
              >
                <ButtonIcon className="h-5 w-5" />
                {button.label}
              </Link>
            );
          })}
        </div>

        {/* Activity Highlights */}
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border bg-card p-8 shadow-lg">
          <h2 className="mb-4 flex items-center justify-center gap-2 text-2xl font-bold text-card-foreground">
            <HighlightsIcon className="h-6 w-6 text-theme-primary" />
            {activityHighlights.title}
          </h2>

          <ul className="space-y-3 text-left text-muted-foreground">
            {activityHighlights.items.map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-theme-primary">•</span>
                <span>
                  <strong>{item.label}</strong> {item.description}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            const iconColor = index === 0 ? 'text-theme-primary' : index === 1 ? 'text-theme-secondary' : 'text-theme-accent';
            return (
              <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
                <FeatureIcon className={`mx-auto mb-3 h-8 w-8 ${iconColor}`} />
                <h3 className="mb-2 font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
