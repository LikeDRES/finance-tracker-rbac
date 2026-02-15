import { GetStaticProps, InferGetStaticPropsType } from "next";
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { getApiDocs } from "@/lib/swagger";

// Cargar SwaggerUI dinámicamente con opciones
const SwaggerUI = dynamic(
  () => import("swagger-ui-react"),
  { 
    ssr: false,
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Cargando documentación...</div>
  }
);

function DocsPage({ spec }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div style={{ height: "100vh", padding: "20px" }}>
      <h1 style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
        Documentación de la API
      </h1>
      <div style={{ border: "1px solid #eaeaea", borderRadius: "8px", overflow: "hidden" }}>
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const spec = await getApiDocs();
  return {
    props: {
      spec,
    },
  };
};

export default DocsPage;