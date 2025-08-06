import test, { expect, Page } from "@playwright/test";
import path from "node:path";
import { app } from "../app";

const timeout_10 = { timeout: 10_000 };
const timeout_20 = { timeout: 20_000 };
const timeout_30 = { timeout: 30_000 };
const timeout_180 = 180_000;

async function page_fully_loaded(page: Page) {
  await expect(page.getByRole("button", { name: "1.0 Introduction" })).toBeEnabled(timeout_20);
  await expect(page.getByRole("button", { name: "2.0 Conformance Claims" })).toBeEnabled(timeout_20);
  await expect(page.getByRole("button", { name: /\d\.0 Security Problem Definition/ })).toBeEnabled(timeout_20);
}

async function do_import(page: Page, fileName?: string) {
  await page.goto(app.url);

  await page_fully_loaded(page);

  if (!!fileName) {
    await page.getByRole("navigation").getByRole("button").click();
    await page.locator("button").filter({ hasText: "File Options" }).click();
    await page.getByLabel("Configures the XML File").click();
    const filePath = path.resolve(__dirname, `../playwright/downloads/${fileName}`);
    console.log(filePath);

    console.time("import took");

    await Promise.all([
      expect(page.getByText(`Loaded in ${fileName}`), "XML parsing complete").toBeVisible({
        timeout: 45_000,
      }),
      expect(page.getByRole("button", { name: "Remove" })).toBeVisible(timeout_20),
      page.getByRole("button", { name: "Remove" }).scrollIntoViewIfNeeded(timeout_20),
      page
        .locator("div")
        .filter({ hasText: /^Upload PP XML$/ })
        .first()
        .locator('input[type="file"]')
        .setInputFiles(filePath),
    ]);

    console.timeEnd("import took");

    // this should not be necessary. Alas, it is. It will cause problems later down the line if the
    // app doesn't get a little extra time to finish whatever it's doing after it's loaded before clicking close
    await page.waitForTimeout(5000);

    console.time("post-close reload took");
    await page.getByRole("button", { name: "Close" }).click(timeout_20);
    console.timeEnd("post-close reload took");

    await page.getByRole("navigation").filter({ hasText: "XML Builder" }).getByRole("button", { expanded: true }).click();
  }

  const metadata_button = page.getByRole("button", {
    name: "Metadata Section",
    exact: true,
  });

  const metadata_open_button = metadata_button.filter({
    has: page.getByLabel("Open Section"),
  });

  const metadata_close_button = metadata_button.filter({
    has: page.getByLabel("Close Section"),
  });

  const metadata_section = metadata_close_button.locator("..");

  return { metadata_open_button, metadata_close_button, metadata_section };
}

async function pp_tests(page: Page, headless: boolean, fileName?: string) {
  if (headless) {
    await page.setViewportSize({ width: 1280, height: 1440 });
  }
  console.dir(page.viewportSize());
  const { metadata_open_button, metadata_close_button, metadata_section } = await do_import(page, fileName);

  await page_fully_loaded(page);

  const buttonSR = page.getByRole("button", {
    name: /\d\.0 Security Requirements/,
  });
  await Promise.all([expect(buttonSR).toBeVisible(timeout_10), expect(buttonSR, "Security Requirements Section existence").toBeEnabled(timeout_20)]);

  await Promise.all([expect(metadata_open_button).toBeVisible(timeout_10), metadata_open_button.click()]);

  await Promise.all([
    expect(metadata_section).toBeVisible(timeout_10),
    expect.soft(metadata_section.getByLabel("PP Name *"), "PP Name filled").toHaveValue(/.{4,}/, timeout_20),
  ]);

  console.dir({ PP_Name: await metadata_section.getByLabel("PP Name *").inputValue() });

  await Promise.all([expect(metadata_close_button).toBeVisible(timeout_10), metadata_close_button.click(timeout_20)]);

  await Promise.all([
    buttonSR.click(),
    expect(buttonSR.locator("..").getByText(/\d\.\d+\.\d+/), "At least one security requirements section subsection").not.toHaveCount(0),
  ]);

  const section5_first_sub = buttonSR
    .locator("..")
    .getByText(/\d\.\d+\.\d+/)
    .first()
    .locator("..")
    .locator("..")
    .locator("..");
  await Promise.all([
    expect(section5_first_sub).toBeVisible(timeout_10),
    section5_first_sub
      .getByRole("button")
      .filter({ has: page.getByLabel("Expand Section") })
      .click(),
  ]);

  const sfr_worksheet_buttons = section5_first_sub.getByRole("button").filter({ has: page.getByLabel("Edit SFR Worksheet") });
  await Promise.all([
    expect(sfr_worksheet_buttons.first()).toBeVisible(timeout_10),
    expect(sfr_worksheet_buttons, "At least one SFR").not.toHaveCount(0),
    sfr_worksheet_buttons.first().click(),
  ]);

  await Promise.all([
    page.getByTestId("CardTemplate_SFR_Element").focus(),
    expect(page.getByTestId("CardTemplate_SFR_Element")).toBeVisible(timeout_20),
    page.getByTestId("CardTemplate_SFR_Element").scrollIntoViewIfNeeded(timeout_20),
    expect(page.getByRole("heading", { name: "SFR Worksheet" })).toBeVisible(timeout_20),
    page.getByRole("heading", { name: "SFR Worksheet" }).scrollIntoViewIfNeeded(timeout_20),
  ]);

  await Promise.all([
    page.locator("#sfr_element_select").click(),
    expect(page.locator("#sfr_element_select")).toBeVisible(timeout_20),
    page.locator("#sfr_element_select").scrollIntoViewIfNeeded(timeout_20),
  ]);

  const sfrListbox = page.getByTestId("sfr_element_select_menu");
  await Promise.all([
    sfrListbox.getByRole("listbox").click(),
    expect(sfrListbox.getByRole("listbox").getByRole("option"), "SFR Element options").not.toHaveCount(0, timeout_10),
    expect(sfrListbox).toBeVisible(timeout_10),
  ]);

  await Promise.all([
    page.locator("#eval_act_select").first().click(),
    expect(page.locator("#eval_act_select").first()).toBeVisible(timeout_20),
    page.locator("#eval_act_select").first().scrollIntoViewIfNeeded(timeout_20),
    expect(page.getByTestId("CardTemplate_Evaluation_Activities")).toBeVisible(timeout_10),
  ]).then(async () => {
    const evaluationActivityOptions = page.getByRole("presentation").getByRole("listbox");
    await Promise.all([
      expect(await evaluationActivityOptions.getByRole("option").count()).toBeGreaterThan(1),
      expect(evaluationActivityOptions).toBeVisible(timeout_20),
    ])
      .then(async () => {
        await Promise.all([
          expect(evaluationActivityOptions.getByRole("option", { name: /Elements|Component/ }), "Evaluation Activity Elements title").not.toHaveCount(
            0,
            timeout_10
          ),
          expect(evaluationActivityOptions).toBeVisible(timeout_20),
          evaluationActivityOptions.scrollIntoViewIfNeeded(timeout_20),
        ]);
      })
      .then(async () => {
        await Promise.all([
          page.getByTestId("eval_act_select_menu").locator("div").first().click(),
          expect(page.getByTestId("eval_act_select_menu").locator("div").first()).toBeVisible(timeout_30),
          page.getByTestId("eval_act_select_menu").locator("div").first().scrollIntoViewIfNeeded(timeout_30),
        ]);
      });
  });

  await Promise.all([
    page.locator("#new_eval_act_select").first().click(),
    expect(page.locator("#new_eval_act_select").first()).toBeVisible(timeout_20),
    page.locator("#new_eval_act_select").first().scrollIntoViewIfNeeded(timeout_20),
  ]).then(async () => {
    const newEvaluationActivityOptions = page.getByRole("presentation").getByRole("listbox");
    await Promise.all([
      expect(await newEvaluationActivityOptions.getByRole("option").count()).toBeGreaterThan(1),
      expect(newEvaluationActivityOptions).toBeVisible(timeout_20),
    ])
      .then(async () => {
        await expect(newEvaluationActivityOptions.getByRole("option", { name: /Elements|Component/ }), "Evaluation Activity Component title").not.toHaveCount(
          0,
          timeout_10
        );
      })
      .then(async () => {
        await Promise.all([
          page.locator("#sfr-worksheet-close-button").click(),
          expect(page.locator("#sfr-worksheet-close-button")).toBeVisible(timeout_20),
          page.locator("#sfr-worksheet-close-button").scrollIntoViewIfNeeded(timeout_20),
          page.getByTestId("new_eval_act_select_menu").locator("div").first().click(),
          expect(page.getByTestId("new_eval_act_select_menu").locator("div").first()).toBeVisible(timeout_30),
          page.getByTestId("new_eval_act_select_menu").locator("div").first().scrollIntoViewIfNeeded(timeout_30),
        ]);
      });
  });

  await Promise.all([
    page
      .getByRole("button")
      .filter({ has: page.getByLabel("Collapse Section") })
      .click(),
    expect(page.getByRole("button").filter({ has: page.getByLabel("Collapse Section") })).toBeVisible(timeout_10),
  ]).then(async () => {
    console.log("SFR checks complete");

    await Promise.all([
      page.getByRole("navigation").filter({ hasText: "XML Builder" }).getByRole("button", { expanded: false }).click(),
      expect(page.getByRole("navigation").filter({ hasText: "XML Builder" })).toBeVisible(timeout_10),
    ]).then(async () => {
      await Promise.all([
        page.locator("#side-bar-export-button").click(),
        expect(page.locator("#side-bar-export-button")).toBeVisible(timeout_20),
        page.locator("#side-bar-export-button").scrollIntoViewIfNeeded(timeout_20),
      ]);
    });
  });

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#final-export-xml-button").scrollIntoViewIfNeeded(timeout_20),
    page.locator("#final-export-xml-button").click(),
    expect(page.locator("#final-export-xml-button")).toBeVisible(timeout_20),
  ]);

  await Promise.all([expect(download.suggestedFilename()).toMatch(/download\.xml/), download.delete()]).then(async () => {
    if (/Direct Rationale/i.test((await page.getByTestId("pp_version").textContent()) ?? "")) {
      console.log("Already Direct Rationale");
    } else {
      console.log("Switching versions");
      await page.waitForTimeout(5000);
      await expect(metadata_open_button).toBeVisible(timeout_10);
      await metadata_open_button.click();

      const template_version_menu = page.locator("#pp_template_version");
      await expect(template_version_menu).toBeVisible(timeout_10);
      await template_version_menu.click();

      const cc2022Standard = page.getByRole("option", { name: "CC2022 Standard" });
      await expect(cc2022Standard).toBeVisible(timeout_10);
      await cc2022Standard.click();

      const confirmTemplateButton = page.getByRole("button", { name: "Confirm Template Switch" });
      await expect(confirmTemplateButton).toBeVisible(timeout_10);
      await confirmTemplateButton.click();
      await expect(page.getByText("PP Template Successfully Switched")).toBeVisible(timeout_10);

      if (await metadata_open_button.isVisible()) {
        await metadata_open_button.click(timeout_20);
      }

      await expect(template_version_menu).toBeVisible(timeout_10);
      await template_version_menu.click();

      await expect(page.getByRole("option", { name: "CC2022 Direct Rationale" })).toBeVisible(timeout_10);
      await page.getByRole("option", { name: "CC2022 Direct Rationale" }).click();

      await expect(confirmTemplateButton).toBeVisible(timeout_10);
      await confirmTemplateButton.click();
      await expect(page.getByText("PP Template Successfully Switched")).toBeVisible(timeout_10);
    }
  });

  console.log("Template switch tests complete");
}

test.describe.configure({ mode: "parallel" });

test("default", async ({ page, headless }) => {
  test.setTimeout(timeout_180);
  await pp_tests(page, headless);
});

test("application", async ({ page, headless }) => {
  test.setTimeout(timeout_180);
  await pp_tests(page, headless, "application.xml");
});

test("gpcp", async ({ page, headless }) => {
  test.setTimeout(timeout_180);
  await pp_tests(page, headless, "gpcp.xml");
});

test("mdm", async ({ page, headless }) => {
  test.setTimeout(timeout_180);
  await pp_tests(page, headless, "mdm.xml");
});

test("mobile-device", async ({ page, headless }) => {
  test.setTimeout(timeout_180);
  await pp_tests(page, headless, "mobile-device.xml");
});

test("operatingsystem", async ({ page, headless }) => {
  test.setTimeout(timeout_180);
  await pp_tests(page, headless, "operatingsystem.xml");
});

test("virtualization", async ({ page, headless }) => {
  test.setTimeout(timeout_180);
  await pp_tests(page, headless, "virtualization.xml");
});
