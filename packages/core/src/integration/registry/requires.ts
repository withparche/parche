import type { ParcheManifest, ResolvedElement } from '../types.js';
import { satisfiesVersion } from './versions.js';

/**
 * Validate parche requirements (V2: presence of every capability, plus
 * peer-parche version ranges). Structural widget-prop checks run where the
 * schemas are available (widgetSchemas generation), not here; what they need
 * is returned. Throws, naming every unmet requirement, when one is missing.
 */
export function checkRequires(input: {
  parches: ParcheManifest[];
  providedElements: Set<string>;
  elements: Record<string, ResolvedElement>;
  providedWidgets: Set<string>;
  providedTemplates: Set<string>;
  providedThemes: Set<string>;
}): Array<{ from: string; name: string; props: string[] }> {
  const { parches, providedElements, elements, providedWidgets, providedTemplates, providedThemes } = input;
  const parcheVersions = new Map<string, string | undefined>(parches.map((p) => [p.name, p.version]));

  const missing: string[] = [];
  const widgetPropRequirements: Array<{ from: string; name: string; props: string[] }> = [];
  for (const parche of parches) {
    const req = parche.requires;
    if (!req) continue;
    for (const p of req.elements ?? []) {
      const name = typeof p === 'string' ? p : p.name;
      if (!providedElements.has(name)) {
        missing.push(`"${parche.name}" requires element "${name}" (parche:elements/${name})`);
      } else if (typeof p === 'object' && p.parts?.length) {
        // Structural check: the provider must expose each named part. An
        // override counts as providing the element but its parts are only
        // known at load time (the catalog checks those), so skip it here.
        const provided = elements[name];
        if (provided) {
          const absent = p.parts.filter((part) => !(part in provided.parts));
          if (absent.length) {
            missing.push(`"${parche.name}" requires element "${name}" to expose part(s): ${absent.join(', ')} — provider "${provided.from}" does not`);
          }
        }
      }
    }
    for (const w of req.widgets ?? []) {
      const name = typeof w === 'string' ? w : w.name;
      if (!providedWidgets.has(name)) {
        missing.push(`"${parche.name}" requires widget "${name}" (parche:widgets/${name})`);
      } else if (typeof w === 'object' && w.props?.length) {
        widgetPropRequirements.push({ from: parche.name, name, props: w.props });
      }
    }
    for (const name of req.templates ?? []) {
      if (!providedTemplates.has(name)) missing.push(`"${parche.name}" requires template "${name}" (parche:templates/${name})`);
    }
    for (const value of req.themes ?? []) {
      if (!providedThemes.has(value)) missing.push(`"${parche.name}" requires theme "${value}"`);
    }
    for (const dep of req.parches ?? []) {
      if (!parcheVersions.has(dep.name)) {
        missing.push(`"${parche.name}" requires parche "${dep.name}"${dep.version ? ` (${dep.version})` : ''} — not imported`);
      } else if (dep.version) {
        const actual = parcheVersions.get(dep.name);
        if (!actual) {
          missing.push(`"${parche.name}" requires "${dep.name}@${dep.version}" but "${dep.name}" declares no version`);
        } else if (!satisfiesVersion(actual, dep.version)) {
          missing.push(`"${parche.name}" requires "${dep.name}@${dep.version}" but found ${actual}`);
        }
      }
    }
  }
  if (missing.length) {
    throw new Error(
      '[parche] Unsatisfied parche requirements — add a parche that provides them:\n  - ' + missing.join('\n  - '),
    );
  }
  return widgetPropRequirements;
}
