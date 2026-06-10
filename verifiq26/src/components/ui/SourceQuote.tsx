/** Verbatim source quote presented as a drawing note. Every finding is source-quoted. */
export function SourceQuote({ quote, reference }: { quote: string; reference: string }) {
  return (
    <figure className="source-quote" style={{ margin: 0 }}>
      <blockquote style={{ margin: 0 }}>{quote}</blockquote>
      <cite className="src-ref">{reference}</cite>
    </figure>
  );
}
