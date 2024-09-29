const { eq } = require("drizzle-orm");
const { db } = require("../../db/db");
const { sensitivityRules } = require("../../db/schema/sensitivityRules");

async function getAllRules(_req, res, next) {
  try {
    const rules = await db.query.sensitivityRules.findMany();
    res.json(rules);
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error getting all sensitivity rules"
    });
  }
}

async function getRuleById(req, res, next) {
  try {
    const { id } = req.params;

    const rule = await db.query.sensitivityRules.findFirst({
      where: (rules, { eq }) => eq(rules.id, id)
    });

    if (!rule) {
      next({
        httpCode: 404,
        error: "not_found",
        errorMessage: "Sensitivity rule not found"
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
      codeSets: rule.code_sets
    });
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error getting sensitivity rule by id"
    });
  }
}

async function createRule(req, res, next) {
  try {
    const {
      id,
      basis: { system, code, display },
      labels,
      codeSets
    } = req.body;

    const newSensitiveRule = {
      id,
      basis_system: system,
      basis_code: code,
      basis_display: display,
      labels,
      code_sets: codeSets
    };

    await db.insert(sensitivityRules).values(newSensitiveRule);

    res.json({
      id,
      basis: { system, code, display },
      labels,
      codeSets
    });
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error creating sensitivity rule"
    });
  }
}

async function updateRule(req, res, next) {
  try {
    const { id } = req.params;
    const {
      basis: { system, code, display },
      labels,
      codeSets
    } = req.body;

    const updatedSensitiveRule = {
      id,
      basis_system: system,
      basis_code: code,
      basis_display: display,
      labels,
      code_sets: codeSets
    };

    await db
      .update(sensitivityRules)
      .set(updatedSensitiveRule)
      .where(eq(sensitivityRules.id, id));

    res.json({
      id,
      basis: { system, code, display },
      labels,
      codeSets
    });
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error updating sensitivity rule"
    });
  }
}

async function deleteRule(req, res, next) {
  try {
    const { id } = req.params;

    await db.delete(sensitivityRules).where(eq(sensitivityRules.id, id));

    res.json({
      id
    });
  } catch (e) {
    next({
      httpCode: 500,
      error: "internal_error",
      errorMessage: "Error deleting sensitivity rule"
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
