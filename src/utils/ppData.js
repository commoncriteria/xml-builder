import app from "../../public/data/sfr_components/app_cc2022.json";
import mdm from "../../public/data/sfr_components/mdm.json";
import gpcp from "../../public/data/sfr_components/gpcp_cc2022.json";
import gpos from "../../public/data/sfr_components/gpos_cc2022.json";
import mdf from "../../public/data/sfr_components/mdf.json";
import nd from "../../public/data/sfr_components/ndcpp.json";
import psd from "../../public/data/sfr_components/psd_5-0.json";
import tls from "../../public/data/sfr_components/tls_cc2022.json";
import virtualization from "../../public/data/sfr_components/virtualization_cc2022.json";
import x509 from "../../public/data/sfr_components/x509.json";

export const dataMap = { app, gpcp, gpos, mdf, mdm, nd, psd, tls, virtualization, x509 };

// Values in this object used for xref's, so they need to be accurate
export const ppLabels = {
  app: "APP",
  gpcp: "GPCP",
  gpos: "GPOS",
  mdf: "MDF",
  mdm: "MDM",
  nd: "ND",
  psd: "PSD",
  tls: "TLS",
  virtualization: "Virtualization",
  x509: "X509",
};
