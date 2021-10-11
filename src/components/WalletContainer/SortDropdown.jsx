import cn from 'classnames';
import { Menu, Transition } from '@headlessui/react';
import PropTypes from 'prop-types';

const SORT_OPTIONS = [
  'Floor Price (High to Low)',
  'Floor Price (Low to High)',
  'NFT Name (A-Z)',
  'NFT Name (Z-A)',
  'Collection Name',
];

// each sort function takes the previous state and returns sorted nftMetadata
export const SortFunctions = [
  // Floor Price (High to Low)
  ({ nftMetadata, floorData }) =>
    nftMetadata.sort(
      (a, b) => (floorData[b.updateAuthority] ?? 0) - (floorData[a.updateAuthority] ?? 0)
    ),
  // Floor Price (Low to High)
  ({ nftMetadata, floorData }) =>
    nftMetadata.sort(
      (a, b) => (floorData[a.updateAuthority] ?? 0) - (floorData[b.updateAuthority] ?? 0)
    ),
  // NFT Name (A-Z)
  ({ nftMetadata }) => nftMetadata.sort((a, b) => a.uriJSON.name.localeCompare(b.uriJSON.name)),
  // NFT Name (Z-A)
  ({ nftMetadata }) => nftMetadata.sort((a, b) => b.uriJSON.name.localeCompare(a.uriJSON.name)),
  // Collection Name
  ({ nftMetadata }) =>
    nftMetadata.sort((a, b) => b.updateAuthority.localeCompare(a.updateAuthority)),
];

const SortDropdown = ({ onSelect }) => (
  <div className="flex items-center justify-end py-2">
    <div className="relative inline-block text-left">
      <Menu>
        {({ open }) => (
          <>
            <span className="rounded-md shadow-sm">
              <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800">
                <span>Sort By</span>
                <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Menu.Button>
            </span>

            <Transition
              show={open}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
              >
                <div className="py-1 cursor-pointer">
                  {SORT_OPTIONS.map((option, index) => (
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          onClick={() => onSelect(index)}
                          className={cn(
                            'flex justify-between w-full px-4 py-2 text-sm leading-5 text-left',
                            {
                              'bg-gray-100': active,
                              'text-gray-900': active,
                              'text-gray-700': !active,
                            }
                          )}
                        >
                          {option}
                        </a>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </div>
  </div>
);

SortDropdown.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default SortDropdown;
