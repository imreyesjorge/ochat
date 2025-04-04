import RootLayout from "./layout";
import { Chat } from "@/components/Chat";

export default function Home() {
  return (
    <RootLayout>
      <div className="size-full">
        <a
          href="https://github.com/imreyesjorge/ochat"
          className="absolute top-0 left-0 m-4 z-50 size-8"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 327 348"
            style={{
              fillRule: "evenodd",
              clipRule: "evenodd",
              strokeLinejoin: "round",
              strokeMiterlimit: 2,
            }}
          >
            <g transform="matrix(1,0,0,1,0.00591709,-174.116)">
              <g transform="matrix(1,0,0,1,-808.093,-660.244)">
                <g>
                  <g transform="matrix(0.196702,0,0,0.213121,592.749,769.853)">
                    <path
                      d="M1920,304.318C2364.62,273.201 2871.43,690.031 2727.56,1111.88C2608.39,1461.33 2258.62,1832.94 1920,1919.44C1488.16,2029.75 994.572,1541.72 1112.44,1111.88C1225.08,701.123 1556.32,329.77 1920,304.318ZM1920,529.985C2241.16,529.985 2501.89,790.723 2501.89,1111.88C2501.89,1433.04 2233.9,1625.91 1920,1693.77C1519,1780.47 1217.4,1564.09 1338.11,1111.88C1420.93,801.586 1598.84,529.985 1920,529.985ZM1920,837.364C1986.76,874.26 2063.29,1000.67 2162.64,1080C2267.28,1163.56 2050.7,1293.48 1920,1322.64C1758,1358.77 1639.23,1263 1677.36,1080C1704.68,948.901 1802.79,772.591 1920,837.364Z"
                      style={{ fill: "white" }}
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </a>
        <Chat />
      </div>
    </RootLayout>
  );
}
