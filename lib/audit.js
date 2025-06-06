const superagent = require("superagent");
const { CONSENT_PERMIT, CONSENT_DENY } = require("./consent-decisions");
const { PURPOSE_OF_USE_SYSTEM } = require("./consent-valuesets");
const { maybeAddAuth } = require("./auth");
const logger = require("./logger");

const auditEventTemplate = require("../template-resources/audit-event.json");

const CONSENT_FHIR_SERVERS = (process.env.CONSENT_FHIR_SERVERS || "")
  .split(",")
  .map((res) => res.trim());

function constructAuditEventResource(decision, query) {
  const auditEvent = JSON.parse(JSON.stringify(auditEventTemplate));
  auditEvent.recorded = new Date();
  auditEvent.outcomeDesc = decision.decision;
  auditEvent.agent[0].who.identifier = query?.actor?.[0];

  const queryPurposeOfUse = [query.purposeOfUse || []].flat();
  const purposeOfUse = queryPurposeOfUse.map((code) => ({
    coding: [
      {
        system: PURPOSE_OF_USE_SYSTEM,
        code
      }
    ]
  }));
  auditEvent.agent[0].purposeOfUse = purposeOfUse;

  const patientEntity = {
    what: decision.patientId,
    type: {
      system: "http://terminology.hl7.org/CodeSystem/audit-entity-type",
      code: "1",
      display: "Person"
    },
    role: {
      system: "http://terminology.hl7.org/CodeSystem/object-role",
      code: "1",
      display: "Patient"
    }
  };

  const consentEntity = {
    what: {
      reference: decision.id
    },
    type: {
      system: "http://terminology.hl7.org/CodeSystem/audit-entity-type",
      code: "2",
      display: "System Object"
    },
    role: {
      system: "http://terminology.hl7.org/CodeSystem/object-role",
      code: "4",
      display: "Domain Resource"
    }
  };

  auditEvent.entity[0] = patientEntity;
  auditEvent.entity[1] = consentEntity;

  return auditEvent;
}

async function recordAudit(decision, query) {
  const auditEventResource = constructAuditEventResource(decision, query);
  const fhirBase = decision.fhirBase;
  try {
    await maybeAddAuth(
      superagent
        .post(`${fhirBase}/AuditEvent`)
        .set("Content-Type", "application/json")
        .send(auditEventResource)
    );
  } catch (e) {
    console.log(e);
    logger.warn(`Failed to create AuditEvent at ${fhirBase}/AuditEvent: ${e}`);
  }
}

async function maybeRecordAudit(decision, query) {
  if (
    decision.decision === CONSENT_PERMIT ||
    decision.decision === CONSENT_DENY
  ) {
    await recordAudit(decision, query);
  }
}

module.exports = {
  maybeRecordAudit
};
