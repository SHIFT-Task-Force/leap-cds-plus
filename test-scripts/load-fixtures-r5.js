const _ = require("lodash");
const fs = require("fs");
const superagent = require("superagent");

const FHIR_BASE = process.argv?.[2];

const LEAP_IDENTIFIER_SYSTEM =
  "http://sdhealthconnect.github.io/leap/samples/ids";

function printUsageAndExit() {
  console.error(
    "Usage: node load-fixtures [FHIR_BASE] [CONSENT_FILE_NAME] (path to consent file in 'fixtures/consents/r5'"
  );
  process.exit(1);
}

function getLeapIdentifer(resource) {
  return resource.identifier.filter(
    (identifier) => identifier.system === LEAP_IDENTIFIER_SYSTEM
  )[0].value;
}

const PATH = "../test/fixtures";

const CONSENT_FILE = `${PATH}/consents/r5/${process.argv?.[3]}`;

if (!FHIR_BASE || !CONSENT_FILE || !fs.existsSync(CONSENT_FILE)) {
  printUsageAndExit();
}

const consent = require(CONSENT_FILE);
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
consent.dateTime = new Date().toISOString();

const entries = [patient, actorOrg, consentOrg, consent].map((resource) => ({
  fullUrl: `urn:uuid:${LEAP_IDENTIFIER_SYSTEM}:${getLeapIdentifer(resource)}`,
  resource: resource,
  request: {
    method: "PUT",
    url: `${
      resource.resourceType
    }?identifier=${LEAP_IDENTIFIER_SYSTEM}|${getLeapIdentifer(resource)}`
  }
}));

const transaction = {
  resourceType: "Bundle",
  id: "bundle-transaction",
  meta: {
    lastUpdated: new Date().toISOString()
  },
  type: "transaction",
  entry: entries
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
