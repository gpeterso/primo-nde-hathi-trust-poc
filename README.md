# Primo NDE HathiTrust Availability Add-on

NDE implementation of the [legacy Primo HathiTrust availability plugin](https://github.com/UMNLibraries/primo-explore-hathitrust-availability)

> [!IMPORTANT]
> This is a work in progress, and the repo will eventually be moved elsewhere. At some point, it will be available as an [NDE add-on](https://knowledge.exlibrisgroup.com/Primo/Product_Documentation/020Primo_VE/Primo_VE_(English)/120Other_Configurations/Managing_Add-Ons_for_the_NDE_UI) (presuming the availability of a suitable hosting option).

## Features 

When a local (non-CDI) search result is displayed in Primo, the record's OCLC numbers (or other optional identifiers) are passed to the [HathiTrust Bib API](https://www.hathitrust.org/bib_api). If at least one item with free full-text access is found, a link to the HathiTrust record is appended to the availability section.

### Screenshot

![screenshot](readme-files/hathi-trust-screenshot.png)

## Configuration options

|Option|Type|Default|Description|
|------|----|-------|-----------|
|`disableWhenAvailableOnline`|boolean|true|Don't check for HathiTrust availability if the record already has online access.|
|`disableForJournals`|boolean|false|Don't check for HathiTrust availability if the record type is a journal.|
|`ignoreCopyright`|boolean|false|Display availability links on all records in HathiTrust, including works not in the public domain. Normally, you won't want to enable this unless [ETAS](https://www.hathitrust.org/member-libraries/services-programs/etas/) is in effect.|
|`matchOn.oclc`|boolean|true|Search HathiTrust using the record's OCLC number(s). This is usually the most reliable match point for HathiTrust records.|
|`matchOn.isbn`|boolean|false|Search HathiTrust using the record's ISBN(s).|
|`matchOn.issn`|boolean|false|Search HathiTrust using the record's ISSN(s).|


> [!TIP]
> You can enable any combination of `matchOn` identifiers, as long as at least one identifier is enabled.

### Example configuration JSON

```json
{
  "disableWhenAvailableOnline": true,
  "disableForJournals": false,
  "ignoreCopyright": false,
  "matchOn": {
    "oclc": true,
    "isbn": false,
    "issn": false
  }
}
```

### Customizing the availability text

The default availability link text is: "Full text from HathiTrust" 

To customize the availability text, add a row to the Primo VE **NDE Custom Defined Labels** code table with the code `HathiTrust.availabilityText` and a description of your choosing. 

## Local deployment 

If you don't want to wait for add-on availability, here's what you'd need to do to incorporate the HathiTrust component into your [NDE custom module](https://github.com/ExLibrisGroup/customModule):

1. Copy the entire `src/app/hathi-trust` directory to your project.
2. Edit your `customComponentMappings.ts` file, and map the component to `nde-online-availability-before`. For example:
```typescript
import { HathiTrustComponent } from '../hathi-trust/hathi-trust.component';

export const selectorComponentMap = new Map<string, any>([
  ['nde-online-availability-before', HathiTrustComponent],
]);
```
3. If you haven't already done so, be sure to configure an `HttpClient` provider in your `app.module.ts` by adding [`provideHttpClient()`](https://angular.dev/guide/http/setup) to the `providers` in the module decorator like so:
```typescript
@NgModule({
declarations: [
  AppComponent,
  AutoAssetSrcDirective
],
exports: [AutoAssetSrcDirective],
imports: [
  BrowserModule,
  CommonModule,
  TranslateModule.forRoot({})
],
providers: [...providers, provideHttpClient()],
bootstrap: []
})
```
4. If you want to override any of the default configuration options, you'll need to modify the defaults in `src/app/hathi-trust/hathi-trust-config/hathi-trust-config.service.ts` instead of providing a JSON config file. 
