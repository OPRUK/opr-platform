import { Eyebrow, PrimaryButton, Divider } from "./_components/primitives";

export default function SplashScreen() {
  return (
    <div className="flex flex-1 flex-col justify-center bg-[#123C39] px-7 pb-10 pt-[100px] text-[#EED8B2]">
      <div className="flex flex-1 flex-col justify-center">
        <Eyebrow tone="cream" className="mb-[18px]">
          Other People&apos;s Recipes
        </Eyebrow>
        <h1 className="text-[56px] leading-[0.98] text-[#EED8B2]">Every recipe has a story.</h1>
        <Divider className="my-7 bg-[#EED8B2]/60" />
        <p className="max-w-[26ch] text-[17px] leading-[1.5]">
          A living cookbook of family recipes from across the world, preserved with the stories behind them.
        </p>
      </div>
      <PrimaryButton href="/app/cookbook" inverted>
        Open the cookbook
      </PrimaryButton>
    </div>
  );
}
