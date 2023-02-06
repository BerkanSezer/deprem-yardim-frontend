import { ClusterPopup } from "@/components/UI/ClusterPopup/ClusterPopup";
import Drawer from "@/components/UI/Drawer/Drawer";
import FooterBanner from "@/components/UI/FooterBanner/FooterBanner";
import { Data, MarkerData } from "@/mocks/types";
import { useMapActions } from "@/stores/mapStore";
import styles from "@/styles/Home.module.css";
import Container from "@mui/material/Container";
import dynamic from "next/dynamic";
import Head from "next/head";
import { KeyboardEvent, MouseEvent, useCallback } from "react";

interface HomeProps {
  results: MarkerData[];
}

const LeafletMap = dynamic(() => import("@/components/UI/Map"), {
  ssr: false,
});

export default function Home({ results }: HomeProps) {
  const { toggleDrawer, setDrawerData, setPopUpData } = useMapActions();

  const handleMarkerClick = useCallback(
    () => (event: KeyboardEvent | MouseEvent, markerData?: MarkerData) => {
      if (
        event.type === "keydown" &&
        ((event as KeyboardEvent).key === "Tab" ||
          (event as KeyboardEvent).key === "Shift")
      )
        return;

      toggleDrawer();

      if (markerData) {
        setDrawerData(markerData);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const togglePopUp = useCallback((e: any) => {
    e.cluster.zoomToBounds({ padding: [20, 20] });

    setPopUpData({
      count: e.markers.length ?? 0,
      baseMarker: e.markers[0].options.markerData,
      markers: e.markers,
    });
  }, [setPopUpData]);

  return (
    <>
      <Head>
        <title>Afet Haritası | Anasayfa</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Container maxWidth={false} disableGutters>
          {/* @ts-expect-error */}
          <LeafletMap onClickMarker={handleMarkerClick()} data={results} onClusterClick={togglePopUp} />
        </Container>
        <Drawer toggler={handleMarkerClick()} />
        <ClusterPopup />
        <FooterBanner />
      </main>
    </>
  );
}

export async function getServerSideProps() {
  // Server-side requests are mocked by `mocks/server.ts`.
  const res = await fetch(
    "https://public-sdc.trendyol.com/discovery-web-websfxgeolocation-santral/geocode?address=gaziantep"
  );
  const data = (await res.json()) as Data;
  const results = data.results;

  return {
    props: {
      results,
    },
  };
}
