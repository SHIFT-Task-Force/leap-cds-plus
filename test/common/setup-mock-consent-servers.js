const _ = require("lodash");
const nock = require("nock");

const CONSENT_FHIR_SERVERS = (process.env.CONSENT_FHIR_SERVERS || "")
  .split(",")
  .map((res) => res.trim());

const BASE_BUNDLE = require("../fixtures/base-bundle.json");
const EMPTY_BUNDLE = require("../fixtures/empty-bundle.json");

const MOCK_FHIR_SERVERS = CONSENT_FHIR_SERVERS.map((fhirBase) =>
  nock(fhirBase)
    .defaultReplyHeaders({ "Content-Type": "application/json; charset=utf-8" })
    .replyContentLength()
);

function setupMockAuditEndpoint(howManyRequests) {
  const numberOfTimes = howManyRequests || 1;
  MOCK_FHIR_SERVERS[0].post("/AuditEvent").times(numberOfTimes).reply(200);
}

function makeBundle(consent) {
  if (consent) {
    const CONSENT_RESULTS_BUNDLE = deepClone(BASE_BUNDLE);
    CONSENT_RESULTS_BUNDLE.entry = [
      ...CONSENT_RESULTS_BUNDLE.entry,
      {
        fullUrl: `${CONSENT_FHIR_SERVERS[0]}/Consent/1`,
        resource: consent
      }
    ];
    CONSENT_RESULTS_BUNDLE.total = 4;
    return CONSENT_RESULTS_BUNDLE;
  } else {
    return EMPTY_BUNDLE;
  }
}

function setupMockConsent(consent, index) {
  const fhirServerIndex = index || 0;
  const { system, value } = {
    system: "http://hl7.org/fhir/sid/us-medicare",
    value: "0000-000-0000"
  };

  const CONSENT_RESULTS_BUNDLE = makeBundle(consent);
  const FHIR_QUERY = {
    "patient.identifier": `${system}|${value}`,
    _include: "Consent:actor"
  };

  MOCK_FHIR_SERVERS[fhirServerIndex]
    .get("/Consent")
    .query(FHIR_QUERY)
    .reply(200, CONSENT_RESULTS_BUNDLE);

  for (var i = 0; i < MOCK_FHIR_SERVERS.length; i++) {
    if (i == fhirServerIndex) continue;
    MOCK_FHIR_SERVERS[i]
      .get("/Consent")
      .query(FHIR_QUERY)
      .reply(200, EMPTY_BUNDLE);
  }
}

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

module.exports = {
  setupMockConsent,
  setupMockAuditEndpoint,
  MOCK_FHIR_SERVERS,
  CONSENT_FHIR_SERVERS
};
