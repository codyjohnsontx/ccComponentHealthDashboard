import { FeatureShell } from "@/src/features/cc-component-health/components/FeatureShell";
import { DemoStateProvider } from "@/src/features/cc-component-health/context/DemoStateProvider";

export default function ComponentHealthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoStateProvider>
      <FeatureShell>{children}</FeatureShell>
    </DemoStateProvider>
  );
}
