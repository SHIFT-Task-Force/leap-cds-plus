const _ = require("lodash");
const fs = require("fs");
const superagent = require("superagent");

const PATH = "../test/fixtures";
const FHIR_BASE = process.argv?.[2];
const CONSENT_FILE = process.argv?.[3];

const LEAP_IDENTIFIER_SYSTEM =
  "http://sdhealthconnect.github.io/leap/samples/ids";

function printUsageAndExit() {
  console.error(
    "Usage: node load-fixtures [FHIR_BASE] [CONSENT_FILE] (path to consent file in 'fixtures/consents/r5'"
  );
  process.exit(1);
}

if (
  !FHIR_BASE ||
  !CONSENT_FILE ||
  !fs.existsSync(`${PATH}/consents/r5/${CONSENT_FILE}`)
) {
  printUsageAndExit();
}

function getLeapIdentifer(resource) {
  return resource.identifier.filter(
    (identifier) => identifier.system === LEAP_IDENTIFIER_SYSTEM
  )[0].value;
}

async function getAllResourceIds(resourceType) {
  try {
    const response = await superagent
      .get(`${FHIR_BASE}/${resourceType}`)
      .query({
        identifier: `${LEAP_IDENTIFIER_SYSTEM}|`,
        _elements: "id"
      })
      .set("Accept", "application/fhir+json");

    const resources = response.body.entry || [];

    const resourceIds = resources.map((entry) => entry.resource.id);

    return resourceIds;
  } catch (error) {
    console.error(
      `Error fetching ${resourceType.toLowerCase()} IDs:`,
      error.message
    );
    return [];
  }
}

async function removeAllResourcesByTypeAndIds(resourceType, ids) {
  try {
    for (const id of ids) {
      await superagent
        .delete(`${FHIR_BASE}/${resourceType}/${id}`)
        .set("Accept", "application/fhir+json");

      console.log(`Deleted ${resourceType} with ID: ${id}`);
    }
    console.log(`All ${resourceType} resources deleted.`);
  } catch (error) {
    console.error(
      `Error deleting ${resourceType.toLowerCase()} with ID: ${error.response.body.issue[0].diagnostics || error.message}`
    );
  }
}

async function removeResourcesByTypes(resourceTypes) {
  for (const resourceType of resourceTypes) {
    const ids = await getAllResourceIds(resourceType);
    await removeAllResourcesByTypeAndIds(resourceType, ids);
  }
}

function prepareEntries() {
  const consent = require(`${PATH}/consents/r5/${CONSENT_FILE}`);
  const patient = require(`${PATH}/patients/patient-boris.json`);
  const consentOrg = require(`${PATH}/organizations/org-hl7.json`);
  const actorOrg = require(`${PATH}/organizations/org-good-health.json`);

  patient.id = "thePatient";
  consentOrg.id = "theConsentOrg";
  actorOrg.id = "theActorOrg";

  consent.subject.reference = `Patient/${patient.id}`;
  consent.manager[0].reference = `Organization/${consentOrg.id}`;
  consent.provision = consent.provision.map((provision) =>
    _.set(
      _.cloneDeep(provision),
      "actor[0].reference.reference",
      `Organization/${actorOrg.id}`
    )
  );
  consent.dateTime && (consent.dateTime = new Date().toISOString());

  return [patient, actorOrg, consentOrg, consent].map((resource) => ({
    fullUrl: `urn:uuid:${LEAP_IDENTIFIER_SYSTEM}:${getLeapIdentifer(resource)}`,
    resource: resource,
    request: {
      method: "PUT",
      url: `${
        resource.resourceType
      }?identifier=${LEAP_IDENTIFIER_SYSTEM}|${getLeapIdentifer(resource)}`
    }
  }));
}

async function loadFixturesToFHIRServer() {
  await removeResourcesByTypes(["Consent"]);
  const transaction = {
    resourceType: "Bundle",
    id: "bundle-transaction",
    meta: {
      lastUpdated: new Date().toISOString()
    },
    type: "transaction",
    entry: prepareEntries()
  };
  superagent
    .post(FHIR_BASE)
    .set("Content-Type", "application/json")
    .send(transaction)
    .then((res) => {
      console.log(JSON.stringify(res.body, null, 2));
    })
    .catch((err) => {
      console.log(err);
    });
}

loadFixturesToFHIRServer();
