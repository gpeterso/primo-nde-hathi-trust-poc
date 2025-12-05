# Primo NDE POC

> [!CAUTION]
> WORK IN PROGRESS

## TODO: 

- [x] get basic functionality working
- [x] add "ignore copyright" support?
- [x] add "not online" support
- [x] add "not journal" support
- [ ] add SAML entity id support?
- [x] figure out how many identifiers to support
- [x] experiment with updating the pnx links section in store (possible, but there be dragons...)

## Notes

### Adding new identifiers

Historically, the HT plugin has only supported OCLC numbers. This is the most reliable match point for US institutions, but it doesn't work so well for others outside the US. 

Other IDs that the HT API accepts: 

- ISBN
- ISSN
- ~~LCCN~~

For ISSN and ISBN, the main concern is CDI. Historically, relying solely on OCLC numbers implicitly limited lookups to local-only records. Perhaps we should add an explicit check for local (e.g. `doc.context === 'L'`)?

For LCCN, there are some weird encoding edge cases. Notably, LCCNs can contain spaces, which the API expects to be encoded as plus signs. Using `uncodeURIComponent` won't work because the query is technically part of the path, so spaces would get encoded as `%20`, which the API rejects with a 403 error, oddly enough.
