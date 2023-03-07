import applyRule from "./applyRule.js";

export default async (rules, data, clean) => {
    let errors = [];
    const ruleFields = Object.keys(rules);
    const dataFields = Object.keys(data);

    if(clean) {
        for(const dataField of dataFields) {
            if(ruleFields.indexOf(dataField) == -1) {
                delete data[dataField];
            }
        } 
    }

    for (const field of ruleFields) {
        const fieldRules = rules[field];
        const fieldRuleKeys = Object.keys(fieldRules);

        for (const rule of fieldRuleKeys) {
            const value = fieldRules[rule];
            const ruleResult = await applyRule(rule, data, field, value);

            if (ruleResult.error) {
                error(field, rule, value);
            } else {
                data = ruleResult.data;
            }
        }
    }

    function error(field, message) {
        let newError = {};

        newError[field] = message;
        errors.push(newError);
    }

    return { errors: errors };
}