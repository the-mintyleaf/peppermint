import { Loader } from "@peppermint/ui";

export default function OrgSubmoduleLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 300,
      }}
    >
      <Loader size="md" color="blue" />
    </div>
  );
}
