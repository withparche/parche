import { useDocs, type Doc } from '../store/documents';

/**
 * A Markdown document's body, edited as text where the preview is. The
 * preview (the other tab of the toolbar) renders it with the site's own
 * Markdown pipeline before it is saved; saving writes it back untouched
 * around the frontmatter.
 */
export default function BodyEditor({ doc }: { doc: Doc }) {
  const editBody = useDocs((s) => s.editBody);
  return (
    <div className="absolute inset-0 z-[5] flex flex-col bg-background">
      <textarea
        aria-label="Markdown body"
        value={doc.body ?? ''}
        readOnly={doc.readOnly}
        onChange={(e) => editBody(doc.key, e.target.value)}
        spellCheck
        className="min-h-0 flex-1 resize-none border-0 bg-background px-8 py-6 font-mono text-[13px] leading-relaxed text-heading outline-none"
      />
    </div>
  );
}
