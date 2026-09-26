import Grid from "components/grid";

export default function Loading() {
  return (
    <>
      <div className="mb-4 h-6" />
      <Grid>
        {Array(12)
          .fill(0)
          .map((_, index) => {
            return (
              <Grid.Item
                key={index}
                className="animate-pulse border border-burgundy/10 bg-cream-dark"
              />
            );
          })}
      </Grid>
    </>
  );
}
