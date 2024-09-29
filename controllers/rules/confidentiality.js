const { eq } = require("drizzle-orm");
const { db } = require("../../db/db");
const {
  confidentialityRules
} = require("../../db/schema/confidentialityRules");

async function getAllRules(_req, res, next) {
  try {
    const rules = await db.query.confidentialityRules.findMany();
    res.json(rules);
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error getting all confidentiality rules"
    });
  }
}

async function getRuleById(req, res, next) {
  try {
    const { id } = req.params;

    const rule = await db.query.confidentialityRules.findFirst({
      where: (rules, { eq }) => eq(rules.id, id)
    });

    if (!rule) {
      next({
        httpCode: 404,
        error: "not_found",
        errorMessage: "Confidentiality rule not found"
      });
    }

    res.json({
      id: rule.id,
      basis: {
        system: rule.basis_system,
        code: rule.basis_code,
        display: rule.basis_display
      },
      labels: rule.labels,
      codes: rule.codes
    });
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error getting confidentiality rule by id"
    });
  }
}

async function createRule(req, res, next) {
  try {
    const {
      id,
      basis: { system, code, display },
      labels,
      codes
    } = req.body;

    const newConfidentialityRule = {
      id,
      basis_system: system,
      basis_code: code,
      basis_display: display,
      labels,
      codes
    };

    await db.insert(confidentialityRules).values(newConfidentialityRule);

    res.json({
      id,
      basis: { system, code, display },
      labels,
      codes
    });
  } catch (e) {
    console.log("error", e);
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error creating confidentiality rule"
    });
  }
}

async function updateRule(req, res, next) {
  try {
    const { id } = req.params;
    const {
      basis: { system, code, display },
      labels,
      codes
    } = req.body;

    const updatedConfidentialityRule = {
      id,
      basis_system: system,
      basis_code: code,
      basis_display: display,
      labels,
      codes
    };

    await db
      .update(confidentialityRules)
      .set(updatedConfidentialityRule)
      .where(eq(confidentialityRules.id, id));

    res.json({
      id,
      basis: { system, code, display },
      labels,
      codes
    });
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error updating confidentiality rule"
    });
  }
}

async function deleteRule(req, res, next) {
  try {
    const { id } = req.params;

    await db
      .delete(confidentialityRules)
      .where(eq(confidentialityRules.id, id));

    res.json({
      id
    });
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error deleting confidentiality rule"
    });
  }
}

module.exports = {
  getAllRules,
  getRuleById,
  createRule,
  updateRule,
  deleteRule
};
