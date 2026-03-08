import { scanBGMDirectory } from "@/lib/scan-bgm";
import ClientApp from "@/components/ClientApp";

export default function Home() {
  const styles = scanBGMDirectory();

  return <ClientApp styles={styles} />;
}
