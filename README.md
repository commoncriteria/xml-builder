# Protection Profile XML Builder

# Live Version
The live version of the Protection Profile (PP) XML Builder can be found here: https://commoncriteria.github.io/xml-builder/
# Tool Overview: 
The PP XML Builder is a form-filling application that allows a user to either import, edit, and export PP XML files, or to generate a PP XML file from an empty template. No knowledge of XML is needed to edit or generate a PP XML file.
# Feature Outline and Guide:
## General Usage: (Read this first!) 
* The tool is currently designed to assist in the development of Base PPs only. When opening the tool, a user will be presented with a blank form that can be filled out with many editable sections of a standard PP, such as Overview, Threats, Objectives, and SFRs.
* The tool currently allows for the import of Base PPs only. To work with a Base PP (Application, Mobile Device, Operating System, Virtualization, General Purpose Computing Platforms), download the xml file you wish to work with from the associated GitHub Repo and import it into the tool using the “Configure XML Options.” Menu option in the navigation bar on the left-hand side. THIS STEP MAY TAKE A FEW MINUTES. PLEASE BE PATIENT.
* Once loaded, the tool will be filled with data from the PP. Some of this data will not be visible/editable, but will be generated by the transforms process when the xml file produced by the tool is loaded into the GitHub repo for that PP.
* Security Functional Requirements (SFR) Creation: The SFR section allows a user to easily view all imported SFRs and to create more in a fashion that does not require XML, but still produces well-formed, usable XML for the purposes of creating release documents through the use of the transforms process, and for the purposes of automation.
* Tests: Tests have been standardized into a testlist > tests > test format. If the imported XML implements a different tag structure, the information from those tags will be loaded into a general-purpose textbox. The text in that textbox can then be moved to the correct testlist/test structure (with dependencies).
* Extended Component Definition: Extended Component Definitions are supported for all PPs. Application 1.4 will not display any Extended Component Definitions when loaded, but they may be added via the tool’s functions.
* XML Preview/export: There is an XML preview toggle on the upper right side of the tool which will allow a user to view the XML that will be generated upon export. There is an export option in the left-hand navigation bar that will allow a user to download the generated XML to their downloads folder.
* Tables: Tables within sections, Audit tables, Management Function tables, and tables in rich-text editors in certain sections are all supported. This includes the new "Tabularize" table format. (Currently only found in General Purpose Computing Platform PP)


## Considerations: (As of October 2024)
* Images: Images are not yet implemented.
* Exact Formatting: The output from this tool will differ slightly in formatting and order due to being automatically produced rather than hand-written.
* Appendices: Some appendices are not being properly exported. This is a known issue and is a planned area of focus for upcoming phases.
>[!NOTE]
>This tool is a proof-of-concept and is in “Phase 2” of development. At least two additional phases are planned.

# Phase 2 Updates:
### New Features:
*	Audit Tables: Audit tables are now imported into the tool and exported if FAU_GEN is present.
*   Management Function Tables: Management tables are now present in FMT_SMF and can be edited by double clicking cells.
*	Security Assurance Requirements: SARs are now imported into the tool, are editable, and will be exported.
*   Rich-Text Editor Tables: Users may now create tables in rich-text editors. Tables can be resized using cell indicators that appear upon selection.
*   Tabularize Tables: The tabularize table format is now supported.
*   "Invisible" SFR categorization option: SFRs may now be categorized as "invisible" which should only be used in certain rare cases. please see the tooltip within the tool or the github.com/commoncriteria wiki for more information.

### Improvements/Bug Fixes:
*   Faster XML File Loading: XML Files now load more quickly.
*   XML File Load Indicators: Users can now see what sections of the file have been loaded during import.
*   Numerous Formatting Corrections: Tests, paragraphs, spacing, and line breaks are more consistent with released documents.
*   Numerous Quality-of-Life Improvements: Certain sections are collapsed or open by default, tooltips have been added, and navigation has been made easier for some sections.

## The Phase 2 implementation of this tool currently handles the following base PPs only:
*	Application 1.4 
*	MDF 3.3 
*	GPOS 4.3 
*	GPCP 1.0 
*	Virtualization 1.1
## The Phase 2 implementation does not allow for editing of the following elements, and supports pass-through export only:
*	Include-pkg and module related external dependencies.
*	Most appendices beyond A, B, and C. Several of these appendices will be generated by the transforms when uploaded to GitHub based on selections made in the SFR section.

>[!NOTE]
>THIS REPO IS THE SECOND DEPLOYMENT OF A PROTOTYPE AND EVALUATION TOOL.
>IT IS NOT MEANT FOR GENERAL USE.

Please provide any feedback you have to the issues board associated with this repo. Your feedback will help this tool or any that comes after it and is greatly appreciated!
https://commoncriteria.github.io/XML-Builder/issues
This software was produced for the U.S.Government under Basic Contract No.W56KGU - 18 - D-0004, and is subject to the Rights in Noncommercial Computer Software and Noncommercial Computer Software Documentation Clause 252.227 - 7014(FEB 2014)
© 2024 The MITRE Corporation.
