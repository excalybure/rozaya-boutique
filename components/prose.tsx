import clsx from "clsx";

const Prose = ({ html, className }: { html: string; className?: string }) => {
  return (
    <div
      className={clsx(
        "prose mx-auto max-w-6xl font-sans text-sm leading-7 text-charcoal/75 prose-headings:mt-8 prose-headings:font-heading prose-headings:font-normal prose-headings:tracking-tight prose-headings:text-burgundy prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg prose-a:text-burgundy prose-a:underline prose-a:decoration-gold prose-a:underline-offset-4 prose-a:hover:text-gold-dark prose-strong:text-charcoal prose-ol:mt-8 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mt-8 prose-ul:list-disc prose-ul:pl-6",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default Prose;
