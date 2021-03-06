/*
 * Copyright 2021 Deokgyu Yang <secugyu@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NameFilters } from './name-filters';
import { OdroidImageInfo } from './odroid-image';

export function fromAracheDirectoryListing($: any, url: string) {
	const images: OdroidImageInfo[] = [];

	$('body table tbody tr').each((_: any, element: any) => {
		const tdList = $(element).find('td');

		let fileName = $(tdList[1]).text().trim();
		let fileModifiedDate = $(tdList[2]).text().trim();
		let fileSize = $(tdList[3]).text().trim();

		if (isParsedStringsEmpty(fileName, fileModifiedDate, fileSize)) {
			fileName = $(tdList[0]).text().trim();
			fileModifiedDate = $(tdList[1]).text().trim();
			fileSize = $(tdList[2]).text().trim();
		}

		if (isParsedStringsEmpty(fileName, fileModifiedDate, fileSize)) {
			return;
		}

		if (hasExcludeExtensions(fileName) || isFilteredByNameFilters(fileName)) {
			return;
		}
		if (!fileSize.includes('M') && !fileSize.includes('G')) {
			return;
		}

		images.push(
			new OdroidImageInfo({
				fileName,
				fileSize,
				lastModified: fileModifiedDate,
				downloadUrl: url + fileName,
			}),
		);
	});

	return images;
}

export function fromH5aiDirectoryListing($: any, url: string) {
	const images: OdroidImageInfo[] = [];

	$('body table tbody tr').each((_: any, element: any) => {
		const tdList = $(element).find('td');

		const fileName = $(tdList[1]).text().trim();

		if (isParsedStringsEmpty(fileName)) {
			return;
		}

		if (hasExcludeExtensions(fileName) || isFilteredByNameFilters(fileName)) {
			return;
		}

		images.push(
			new OdroidImageInfo({
				fileName,
				fileSize: '',
				lastModified: $(tdList[2]).text().trim(),
				downloadUrl: url + fileName,
			}),
		);
	});

	return images;
}

export function fromGithubReleases($: any, url: string) {
	const images: OdroidImageInfo[] = [];

	$('body main details div div .flex-items-center').each(
		(_: any, element: any) => {
			const fileLink = $(element).find('a')?.attr('href') as string;
			let fileSize = $(element).find('small').text().trim();
			// Remove last "B" character in size unit and whitespaces
			fileSize = fileSize.slice(0, -1).replace(/\s/g, '');

			if (fileLink === undefined) {
				return;
			}

			const fileLinkSplitted = fileLink.split('/');
			const fileName = fileLinkSplitted[fileLinkSplitted.length - 1];

			if (isParsedStringsEmpty(fileName)) {
				return;
			}

			if (hasExcludeExtensions(fileName) || isFilteredByNameFilters(fileName)) {
				return;
			}

			const urlSplitted = url.split('/');
			images.push(
				new OdroidImageInfo({
					fileName,
					fileSize,
					lastModified: '',
					downloadUrl: urlSplitted[0] + '//' + urlSplitted[2] + fileLink,
				}),
			);
		},
	);

	return images;
}

function isParsedStringsEmpty(...args: string[]) {
	let isEmpty = false;
	args.forEach((value: string) => {
		if (value.length === 0) {
			isEmpty = true;
		}
	});

	return isEmpty;
}

function isFilteredByNameFilters(fileName: string) {
	let isFiltered = true;

	console.log(NameFilters.nameFilters.oneOfThese);
	console.log(NameFilters.nameFilters.hasToContain);

	NameFilters.nameFilters.oneOfThese.forEach((filter) => {
		if ((fileName as string).toLowerCase().indexOf(filter) !== -1) {
			isFiltered = false;
			return;
		}
	});

	NameFilters.nameFilters.hasToContain.forEach((filter) => {
		if ((fileName as string).toLowerCase().indexOf(filter) === -1) {
			isFiltered = true;
			return;
		}
	});

	return isFiltered;
}

function hasExcludeExtensions(name: string) {
	if (
		name.toLowerCase().indexOf('.md5') !== -1 ||
		name.toLowerCase().indexOf('.asc') !== -1 ||
		name.toLowerCase().indexOf('.sha') !== -1 ||
		name.toLowerCase().indexOf('.txt') !== -1 ||
		name.toLowerCase().indexOf('.torrent') !== -1
	) {
		return true;
	}

	return false;
}
