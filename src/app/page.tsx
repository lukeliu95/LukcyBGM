import { getStaticStyles } from "@/data/tracks";
import ClientApp from "@/components/ClientApp";

export default function Home() {
  const styles = getStaticStyles();

  return <ClientApp styles={styles} />;
}
