import puppeteer from "puppeteer";
import { PassportStatusResponse } from "./passport/types/passport-response";
import { AppConfig } from "./types/app-config";

const config: AppConfig = {
  pageUrl:
    "https://servicos.dpf.gov.br/sinpa/jsp/v2/solicitacao/consultarSolicitacao.jsp",
  passportRequestConfig: {
    protocolNumber: "1.2022.0003566737",
    cpfNumber: "07218299377",
  },
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.goto(config.pageUrl);

    await page.type(".protocolo", config.passportRequestConfig.protocolNumber);
    await page.type(".cpf", config.passportRequestConfig.cpfNumber);
    await page.click(".btn-primary");

    const tableResult = await page.waitForSelector(".table");

    const result = await page.evaluate(() => {
      const data = [
        ...document.querySelectorAll<HTMLAnchorElement>("table tr td"),
      ].map((td) => td.innerText);

      const passportStatus: PassportStatusResponse = {
        requestedDate: data[0],
        protocolNumber: data[1],
        name: data[2],
        status: data[3],
      };
      return passportStatus;
    });

    console.log(result);

    await browser.close();
  } catch (error: any) {
    console.log("[Error]", error?.message);
    await browser.close();
  }
})();
