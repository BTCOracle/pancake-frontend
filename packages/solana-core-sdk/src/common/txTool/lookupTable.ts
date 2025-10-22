import { Connection, PublicKey, AddressLookupTableAccount } from "@solana/web3.js";
import { getMultipleAccountsInfo } from "../accountInfo";

export interface CacheLTA {
  [key: string]: AddressLookupTableAccount;
}

export async function getMultipleLookupTableInfo({
  connection,
  address,
}: {
  connection: Connection;
  address: PublicKey[];
}): Promise<CacheLTA> {
  const dataInfos = await getMultipleAccountsInfo(
    connection,
    [...new Set<string>(address.map((i) => i.toString()))].map((i) => new PublicKey(i)),
  );

  const outDict: CacheLTA = {};
  for (let i = 0; i < address.length; i++) {
    const info = dataInfos[i];
    const key = address[i];
    if (!info) continue;
    const lookupAccount = new AddressLookupTableAccount({
      key,
      state: AddressLookupTableAccount.deserialize(info.data),
    });
    outDict[key.toString()] = lookupAccount;
    LOOKUP_TABLE_CACHE[key.toString()] = lookupAccount;
  }

  return outDict;
}

export const LOOKUP_TABLE_CACHE: CacheLTA = {
  EgmceeYvnYePkH5ABEGYxWqQdcRirb59A7wXU4QDwrhe: new AddressLookupTableAccount({
    key: new PublicKey("EgmceeYvnYePkH5ABEGYxWqQdcRirb59A7wXU4QDwrhe"),
    state: AddressLookupTableAccount.deserialize(
      Buffer.from(
        "AQAAAP//////////PNSwFAAAAAAUAb3PdT2O5+KfdpBx1KeKwVfOLWQz2HWIaowa1p8kuO6aAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAan1RcZLFxRIYzJTD1K8X9Y2u4Im6H9ROPb2YoAAAAABqfVFxjHdMkoVmOYaR1etoteuKObS21cc1VbIQAAAAADBkZv5SEXMv/srbpyw5vnvIzlu8X3EmssQ5s6QAAAAAVKU1D4XciC1hSlVnJ4iilt3x6rq9CmBniISTL07vagBUpTWpkpIQZNJOhxYNo4fHw1td28kruB5B+oQEEFRI0G3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqQbd9uHudY/eGEJdvORszdq2GvxNg7kNJ/69+SjYoYv8jJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+FkGm4hX/quBhPtof2NGGMA12sQ53BrrO1WYoPAAAAAAAYMN/J/eX+a4qnwEpHbpHorGuyZKrZD6GcnfSdhcPlteC3BlsePRfEU4nVJ/awTDzVi4bHMaoP21SbbRvAP4KUb53csf4viOu6xfW5e0uQrUlVGWK4lBnXZShGIoReQc+PYu95SdlIJx35Ydgmle+RrihmTUyiHIC7n60di/WGsX9zmNarWcINNkARJjspkeYnjB1UEFJUIrDNDWBkzLaMvl4tmmquhsGWVCDFz+lra0N9byMqZ/2BOkqcL/yrd4DgOO/SF/16JHyuqLZY+arNiwdid4BEE7x7iqaZRCV12jztBTbaOOYArvVI2JPg92dXNUuvoQWDKE8QGrtvf5aukX+rOcVzcUHWiaLa895uZQPYRb7LwleapJCDnXRrzNs+fqasXP9gm8mu+HJnXKPfNmRQizbl2W4j0T6KSRWHBzHahOa18ge8fvDw1wXxOF0P+MwUMf6lDFf1hMZ3UZXDxGp7cyE+Rkco7mlzoh6KMRFV/PY9BoxHH1zCXK0FC5EBZKDYp+XSm4am2UpWuNicm4AZHmBCkDFDExFnoWRw8ESH6F8JifGO9Fg+P8SHW2+fDDgB74fuhE/pJ8PFDDASj8tBHTR1mwxoQeYKaUZdxZoy+LAtTFym9Z9IJb0/wqrT4IqT7QHkik0SCsFePWpAcC/PWpKay2WW12yr/Ur8GkSKbaoAa0IGjD8bb6VcHDG1TAAfj9Ugzuh654L+9MrXffbrtMdUeM1PAozNsWdNBzntSC2vnPnn5xNcgPDFLDsRK6gZZqSNdCE7o+Su9qK5eysiz9yUcbsOliPTKL0Rr2hnL5tLVenwOjvHbKYr1EBbEWAwV3mGV7Hrt4iMdMGSbndOYsn8A8+QEsInXW5bHPf0Rhrvemd3QhtTGt6upFkSEgsYnG9ljvslCRA7o6vXoN9GFhX9e7Vq8Ry0kHozo+6HJDN/2u3MhJestwEvBxBphaif95H7Yk4ACiSSTLBq4=",
        "base64",
      ),
    ),
  }),
};
