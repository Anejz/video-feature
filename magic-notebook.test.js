const { evalMathExpression, magicNotebook } = require('./magic-notebook');


describe('magic notebook basic functionality', () => {
  it('should handle empty lines', () => {
    expect(magicNotebook([''])).toStrictEqual(['']);
  });

  it('should handle empty lines and comments', () => {
    expect(magicNotebook(['', '# comment'])).toStrictEqual(['', '# comment']);
  });

  it('should handle multiple calculations', () => {
    expect(magicNotebook(['1+2', '3+4 # test'])).toStrictEqual([
      '1+2\t→ 3',
      '3+4 # test\t→ 7',
    ]);
  });

  it('should show decimal result if it differs from the exact result', () => {
    expect(magicNotebook(['1/3', '73829293/34737'])).toStrictEqual([
      '1/3\t→ 1/3\tDECIMAL: (0.333333333333333333)',
      '73829293/34737\t→ 73829293/34737\tDECIMAL: (2125.379077064801220601)',
    ]);
  });
});

describe('magicNotebook scope', () => {
  it('should handle variable assignments in a scope', () => {
    expect(magicNotebook(['x=1', 'x+2'])).toStrictEqual([
      'x=1\t→ 1',
      'x+2\t→ 3',
    ]);
  });

  it('should handle assignment and calculation of a function in a scope', () => {
    expect(magicNotebook(['f(x):=x+1', 'x=2', 'f(x)'])).toStrictEqual([
      'f(x):=x+1\t→ 1+x',
      'x=2\t→ 2',
      'f(x)\t→ 3',
    ]);
  });
});

describe('magicNotebook tries evaluating with := and = swapped after fails', () => {
  it('should swap := for =', () => {
    expect(magicNotebook(['x := 1', 'x+2'])).toStrictEqual([
      'x := 1\t→ 1',
      'x+2\t→ 3',
    ]);
  });

  it('should not swap when not needed', () => {
    expect(magicNotebook(['x = 1', 'x+2'])).toStrictEqual([
      'x = 1\t→ 1',
      'x+2\t→ 3',
    ]);
  });

  it('should try swapping and return even for invalid expressions', () => {
    expect(magicNotebook(['x = 1', 'x+2| # invalid expression'])).toStrictEqual(
      ['x = 1\t→ 1', 'x+2| # invalid expression'],
    );
  });
});

describe('basic expressions', () => {
  it('should handle basic calculations', () => {
    expect(evalMathExpression('1+2', {}).result).toStrictEqual('3');
  });

  it('should handle abs with abs()', () => {
    expect(evalMathExpression('abs(5*x^2)-x+11', {}).result).toStrictEqual(
      '-x+5*x^2+11',
    );
  });

  it('should handle expand', () => {
    expect(evalMathExpression('expand(x*(x+1)^5)', {}).result).toStrictEqual(
      '10*x^3+10*x^4+5*x^2+5*x^5+x+x^6',
    );
  });

  it('should handle pfactor', () => {
    expect(evalMathExpression('pfactor(114)', {}).result).toStrictEqual(
      '(19)*(2)*(3)',
    );
  });
});

describe('trigonometry', () => {
  it('should handle trigonometric functions', () => {
    expect(evalMathExpression('sin(x)', { x: '0' }).result).toStrictEqual('0');
  });

  it('should handle hyperbolic functions', () => {
    expect(evalMathExpression('sinh(x)', { x: '0' }).result).toStrictEqual('0');
  });
});

describe('magicNotebook matrix and vector', () => {
  it('should handle dot product', () => {
    expect(evalMathExpression('dot([1,2,3],[5,6,7])', {}).result).toStrictEqual(
      '38',
    );
  });

  it('should handle matrices', () => {
    expect(evalMathExpression('imatrix(3)', {}).result).toStrictEqual(
      'matrix([1],[0],[0],[0],[1],[0],[0],[0],[1])',
    );
  });

  it('should handle determinant of a matrix', () => {
    expect(
      evalMathExpression('determinant(matrix([7,1],[11,2]))', {}).result,
    ).toStrictEqual('3');
  });
});

describe('complex numbers', () => {
  it('should handle complex numbers', () => {
    expect(evalMathExpression('sqrt(-1)', {}).result).toStrictEqual('i');
  });

  it('should handle absolute value of a complex number', () => {
    expect(evalMathExpression('abs(i)', {}).result).toStrictEqual('1');
  });

  it('should handle complex conjugate', () => {
    expect(evalMathExpression('conjugate(sqrt(-1))', {}).result).toStrictEqual(
      '-i',
    );
  });
});

describe('calculus', () => {
  it('should handle derivative', () => {
    expect(evalMathExpression('diff(x^2,x)', {}).result).toStrictEqual('2*x');
  });

  it('should handle integral', () => {
    expect(evalMathExpression('integrate(x^2,x)', {}).result).toStrictEqual(
      '(1/3)*x^3\tDECIMAL: (0.3333333333333333*x^3)',
    );
  });

  it('should handle sum', () => {
    expect(evalMathExpression('sum(x^2+x, x, 0, 10)', {}).result).toStrictEqual(
      '440',
    );
  });
});

describe('algebra', () => {
  it('should support gcd', () => {
    expect(evalMathExpression('gcd(10,15)', {}).result).toStrictEqual('5');
  });
});
