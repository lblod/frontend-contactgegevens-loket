import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task, all } from 'ember-concurrency';

/** @typedef { import('../au-address-search').Address } Address */

/** @typedef { Pick<Address,"municipality"|"province"|"postalCode"> } PartialAddress */

/**
 * @typedef {('West-Vlaanderen' | 'Oost-Vlaanderen' | 'Antwerpen' | 'Vlaams-Brabant' | 'Limburg')} Province
 */

/**
 * @typedef {Object} PostalNameSuggestion
 * @property {string} postalName - The postal name.
 * @property {string} postalCode - The postal code.
 * @property {Province} province - The province associated with the postal name.
 * @property {boolean} isMunicipality - Indicates if it's a municipality.
 * @property {string} associatedMunicipality - The associated municipality.
 */

/**
 * @typedef {Object} PostalCodeSuggestion
 * @property {string} postalCode - The postal code.
 * @property {Province} province - The province associated with the postal code.
 * @property {Array<{ name: string, isMunicipality: boolean }>} postalNames - An array of postal names associated with the postal code.
 */

/**
 * @typedef { {postalNameSelection: PostalNameSuggestion | null, postalCodeSelection: PostalCodeSuggestion | null, provinceSelection: Province | null} } ManualSelections
 */

/**
 *
 * @param {Record<string,any>} params
 * @returns string
 */
function generateQueryString(params) {
  return Object.keys(params)
    .reduce((acc, key) => {
      if (params[key]) acc.append(key, params[key]);
      return acc;
    }, new URLSearchParams())
    .toString();
}

export default class AuAddressSearchManualControlsBelgiumComponent extends Component {
  constructor(...args) {
    super(...args);
    this._initTask.perform();
  }

  /** @type { Partial<Address> } */
  get selectedAddress() {
    return this.args.address;
  }

  set selectedAddress(value) {
    this.args.onChange(value);
  }

  /** @type { ManualSelections } */
  @tracked _selections = {
    postalNameSelection: null,
    postalCodeSelection: null,
    provinceSelection: null,
  };

  /** @type { ManualSelections } */
  get selections() {
    return this._selections;
  }

  /** @type { ManualSelections } */
  set selections(value) {
    this._selections = value;
    const newAddress = this.completed
      ? {
          ...this.args.address,
          municipality:
            this.selections.postalNameSelection.associatedMunicipality,
          postalCode: this.selections.postalCodeSelection.postalCode,
          province: this.selections.provinceSelection,
        }
      : {
          ...this.args.address,
          municipality: undefined,
          postalCode: undefined,
          province: undefined,
        };
    this.selectedAddress = newAddress;
  }

  get completed() {
    return Object.values(this.selections).every((item) => item !== null);
  }

  _initTask = task(async () => {
    const initMunicipality = this.args.address?.municipality;
    const initPostalCode = this.args.address?.postalCode;
    const initProvince = this.args.address?.province;
    /** @type { PostalNameSuggestion | null } */
    const postalNameSelection =
      initMunicipality && initPostalCode && initProvince
        ? {
            isMunicipality: true,
            associatedMunicipality: initMunicipality,
            postalCode: initPostalCode,
            postalName: initMunicipality,
            province: initProvince,
          }
        : null;
    /** @type { PostalCodeSuggestion | null } */
    const postalCodeSelection =
      initPostalCode && initMunicipality && initProvince
        ? {
            postalCode: initPostalCode,
            postalNames: [
              {
                isMunicipality: true,
                name: initMunicipality,
              },
            ],
            province: initProvince,
          }
        : null;
    /** @type { Province | null } */
    const provinceSelection = initProvince ? initProvince : null;
    this.selections = {
      postalNameSelection,
      postalCodeSelection,
      provinceSelection,
    };
    // Now performing a copy of the _restartAllFetches task, the next lines of code are a copy of the
    // async function body of this task
    // This could not be separated out into an async function because of babel transpilation limitations
    // It would not allow an async method restartAllFetches to be defined and passed to the task function
    // as a parameter.
    // Skip the actual fetches if completed
    if (this.completed) {
      return;
    }
    // Restart the other tasks
    const province = this.selections.provinceSelection
      ? this.selections.provinceSelection
      : undefined;
    const postalCode = this.selections.postalCodeSelection
      ? this.selections.postalCodeSelection.postalCode
      : undefined;
    const postalName = this.selections.postalNameSelection
      ? this.selections.postalNameSelection.postalName
      : undefined;

    const childTasks = [];
    if (!this.selections.postalNameSelection) {
      childTasks.push(
        this.fetchPostalNamesTask.perform({ province, postalCode }),
      );
    }
    if (!this.selections.postalCodeSelection) {
      childTasks.push(
        this.fetchPostalCodesTask.perform({ province, postalName }),
      );
    }
    if (!this.selections.provinceSelection) {
      childTasks.push(
        this.fetchProvincesTask.perform({ postalName, postalCode }),
      );
    }
    if (childTasks.length) {
      await all(childTasks);
      this._autoSelectWhenOnlyOneOption();
    }
  });

  _restartAllFetchesTask = task(async () => {
    // Skip the actual fetches if completed
    if (this.completed) {
      return;
    }
    // Restart the other tasks
    const province = this.selections.provinceSelection
      ? this.selections.provinceSelection
      : undefined;
    const postalCode = this.selections.postalCodeSelection
      ? this.selections.postalCodeSelection.postalCode
      : undefined;
    const postalName = this.selections.postalNameSelection
      ? this.selections.postalNameSelection.postalName
      : undefined;

    const childTasks = [];
    if (!this.selections.postalNameSelection) {
      childTasks.push(
        this.fetchPostalNamesTask.perform({ province, postalCode }),
      );
    }
    if (!this.selections.postalCodeSelection) {
      childTasks.push(
        this.fetchPostalCodesTask.perform({ province, postalName }),
      );
    }
    if (!this.selections.provinceSelection) {
      childTasks.push(
        this.fetchProvincesTask.perform({ postalName, postalCode }),
      );
    }
    if (childTasks.length) {
      await all(childTasks);
      this._autoSelectWhenOnlyOneOption();
    }
  });

  _eraseAll() {
    this.selections = {
      postalCodeSelection: null,
      postalNameSelection: null,
      provinceSelection: null,
    };
    this._restartAllFetchesTask.perform();
  }

  _autoSelectWhenOnlyOneOption() {
    const acc = {};
    if (this.postalNameOptions.length === 1)
      acc.postalNameSelection = this.postalNameOptions[0];
    if (this.postalCodeOptions.length === 1)
      acc.postalCodeSelection = this.postalCodeOptions[0];
    if (this.provinceOptions.length === 1)
      acc.provinceSelection = this.provinceOptions[0];

    if (Object.keys(acc).length)
      this.selections = {
        ...this.selections,
        ...acc,
      };
  }

  fetchPostalNamesTask = task(async ({ postalCode, province }) => {
    const response = await fetch(
      `/address-search-add-on/postal-names?${generateQueryString({
        postalCode,
        province,
      })}`,
    );
    // API error. Nuke the parent component
    if (response.status !== 200) {
      const apiError = `Status ${response.status}:\n${(
        await response.text()
      ).slice(0, 1_000)}`;
      this.args.onApiError(apiError);
      return [];
    }
    /** @type {PostalNameSuggestion[]} */
    const postalNameSuggestions = await response.json();
    return postalNameSuggestions;
  });

  get postalNameOptions() {
    return this.fetchPostalNamesTask.last?.value ?? [];
  }

  /**
   *
   * @param {PostalNameSuggestion} newSuggestion
   */
  @action handlePostalNameChange(newSuggestion) {
    this.selections = {
      ...this.selections,
      postalNameSelection: newSuggestion,
    };
    this._restartAllFetchesTask.perform();
  }

  fetchPostalCodesTask = task(async ({ postalName, province }) => {
    const response = await fetch(
      `/address-search-add-on/postal-codes?${generateQueryString({
        postalName,
        province,
      })}`,
    );
    // API error. Nuke the parent component
    if (response.status !== 200) {
      const apiError = `Status ${response.status}:\n${(
        await response.text()
      ).slice(0, 1_000)}`;
      this.args.onApiError(apiError);
      return [];
    }
    /** @type {PostalCodeSuggestion[]} */
    const postalCodeSuggestions = await response.json();
    return postalCodeSuggestions;
  });

  get postalCodeOptions() {
    return this.fetchPostalCodesTask.last?.value ?? [];
  }

  /**
   *
   * @param {PostalCodeSuggestion} newSuggestion
   */
  @action handlePostalCodeChange(newSuggestion) {
    this.selections = {
      ...this.selections,
      postalCodeSelection: newSuggestion,
    };
    this._restartAllFetchesTask.perform();
  }

  fetchProvincesTask = task(async ({ postalName, postalCode }) => {
    const response = await fetch(
      `/address-search-add-on/provinces?${generateQueryString({
        postalName,
        postalCode,
      })}`,
    );
    // API error. Nuke the parent component
    if (response.status !== 200) {
      const apiError = `Status ${response.status}:\n${(
        await response.text()
      ).slice(0, 1_000)}`;
      this.args.onApiError(apiError);
      return [];
    }
    /** @type {Province[]} */
    const provinces = await response.json();
    return provinces;
  });

  get provinceOptions() {
    return this.fetchProvincesTask.last?.value ?? [];
  }

  /**
   *
   * @param {Province} newSuggestion
   */
  @action handleProvinceChange(newSuggestion) {
    this.selections = { ...this.selections, provinceSelection: newSuggestion };
    this._restartAllFetchesTask.perform();
  }

  get anyLoading() {
    return (
      this.fetchPostalNamesTask.isRunning ||
      this.fetchPostalCodesTask.isRunning ||
      this.fetchProvincesTask.isRunning ||
      this._initTask.isRunning
    );
  }

  /**
   * Helper function to print postal code suggestions
   * @param {PostalCodeSuggestion} suggestion
   * @returns {string}
   */
  // eslint-disable-next-line no-unused-vars
  printPostalCodeSuggestion(suggestion) {
    const names = suggestion.postalNames
      .map((postalName) => postalName.name)
      .sort();
    if (!names.length) return `${suggestion.postalCode}`;
    return `${suggestion.postalCode} (${names.join(', ')})`;
  }
}
