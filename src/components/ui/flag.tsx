/** Flag emoji render as plain letters on Windows, so we use small flag images (flagcdn.com, free). */
export function Flag({ code, name }: { code: string; name: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/24x18/${code}.png`}
      srcSet={`https://flagcdn.com/48x36/${code}.png 2x`}
      width={24}
      height={18}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="h-[18px] w-6 rounded-[3px] object-cover"
      title={name}
    />
  );
}
