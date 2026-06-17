import type { GateInstance, GateType } from '../types/quantum';

function qubitTargetString(targetQubits: number[], qubitNames: string[] = []): string {
  return targetQubits.map((q) => qubitNames[q] ?? `q[${q}]`).join(', ');
}

function gateToQasmName(type: GateType): string | null {
  switch (type) {
    case 'H': return 'h';
    case 'X': return 'x';
    case 'Y': return 'y';
    case 'Z': return 'z';
    case 'S': return 's';
    case 'T': return 't';
    case 'Sdg': return 'sdg';
    case 'Tdg': return 'tdg';
    case 'CNOT': return 'cx';
    case 'CZ': return 'cz';
    case 'CY': return 'cy';
    case 'SWAP': return 'swap';
    case 'Toffoli': return 'ccx';
    case 'Fredkin': return 'cswap';
    case 'I': return 'id';
    case 'Rx': return 'rx';
    case 'Ry': return 'ry';
    case 'Rz': return 'rz';
    case 'Measure': return 'measure';
    default: return null;
  }
}

export function gateInstanceToQasm(
  gate: GateInstance,
  qubitNames: string[] = [],
  classicalReg?: string
): string {
  const name = gateToQasmName(gate.type);
  if (!name) return '';

  if (gate.type === 'Measure') {
    const q = qubitNames[gate.targetQubits[0]] ?? `q[${gate.targetQubits[0]}]`;
    const c = classicalReg ? `${classicalReg}[${gate.targetQubits[0]}]` : `c[${gate.targetQubits[0]}]`;
    return `measure ${q} -> ${c};`;
  }

  const angleParam =
    (gate.type === 'Rx' || gate.type === 'Ry' || gate.type === 'Rz') && gate.angle !== undefined
      ? `(${gate.angle.toFixed(6)})`
      : '';
  const targets = qubitTargetString(gate.targetQubits, qubitNames);
  return `${name}${angleParam} ${targets};`;
}

export function circuitToQasm(
  qubitCount: number,
  gates: GateInstance[],
  includeHeader: boolean = true,
  includeMeasurement: boolean = true
): string {
  const lines: string[] = [];

  if (includeHeader) {
    lines.push('OPENQASM 2.0;');
    lines.push('include "qelib1.inc";');
    lines.push('');
  }

  lines.push(`qreg q[${qubitCount}];`);

  const validGates = gates.filter((g) =>
    g.targetQubits.length > 0 &&
    g.targetQubits.every((q) => q >= 0 && q < qubitCount)
  );

  const hasMeasure = validGates.some((g) => g.type === 'Measure');
  if (hasMeasure || includeMeasurement) {
    lines.push(`creg c[${qubitCount}];`);
  }
  lines.push('');

  const sorted = [...validGates].sort((a, b) => {
    if (a.column !== b.column) return a.column - b.column;
    return a.targetQubits[0] - b.targetQubits[0];
  });

  for (const gate of sorted) {
    if (gate.type === 'Measure') {
      lines.push(gateInstanceToQasm(gate));
    } else {
      lines.push(gateInstanceToQasm(gate));
    }
  }

  if (includeMeasurement && !hasMeasure) {
    lines.push('');
    lines.push('// Final measurements');
    for (let q = 0; q < qubitCount; q++) {
      lines.push(`measure q[${q}] -> c[${q}];`);
    }
  }

  return lines.join('\n');
}

export function downloadQasmFile(content: string, filename: string = 'circuit.qasm'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (e) {
      reject(e);
    } finally {
      document.body.removeChild(ta);
    }
  });
}
