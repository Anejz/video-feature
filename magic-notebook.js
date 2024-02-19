const nerdamer = require('nerdamer');

require('nerdamer/Algebra');
require('nerdamer/Calculus');

const NOT_EVALUATABLE_EXPRESSIONS = ['pfactor', 'solve'];

const evalMathExpression = (expression, scope, trySwapAfterFails = true) => {
  nerdamer.clearVars();
  nerdamer.flush();

  try {
    let result = nerdamer(expression, scope, 'numer');
    const isNotEvaluable = NOT_EVALUATABLE_EXPRESSIONS.some((e) =>
      expression.includes(e),
    );

    if (!isNotEvaluable) {
      try {
        result = result.evaluate();
      } catch (error) {}
    }

    const vars = nerdamer.getVars('text');
    nerdamer.clearVars();
    nerdamer.flush();

    const res = result.text('fractions');
    const resDecimal = result.text('decimals');
    return {
      result: res === resDecimal ? res : `${res}\tDECIMAL: (${resDecimal})`,
      scope: { ...scope, ...vars },
    };
  } catch (error) {
    const vars = nerdamer.getVars('text');
    nerdamer.clearVars();
    nerdamer.flush();

    const hasAssignment = expression.includes(':=');

    if (trySwapAfterFails && hasAssignment) {
      return evalMathExpression(
        expression.replaceAll(hasAssignment ? ':=' : '=', hasAssignment ? '=' : ':='),
        { ...scope, ...vars },
        false,
      );
    } else {
      return { scope: { ...scope, ...vars } };
    }
  }
};

function magicNotebook(lines) {
    console.log("magicNotebook called with:", lines);
  const results = [];
  let scope = {};

  for (const line of lines) {
    const expression = line.split('#')[0].replaceAll(' ', '');

    if (expression === '') {
      results.push(line);
      continue;
    }

    try {
      const evaluation = evalMathExpression(expression, scope);
      scope = evaluation.scope;
      const newLine = evaluation.result == null ? line : `${line}\t→ ${evaluation.result}`;
      results.push(newLine);
    } catch (error) {
      results.push(`${line}\t→ napaka pri evalvaciji, ne moreš biti prepričan o rezultatu`);
    }
  }
  return results;
}

module.exports = { magicNotebook, evalMathExpression };
